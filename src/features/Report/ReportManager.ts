import RNFS from 'react-native-fs';
import Mailer from 'react-native-mail';
import moment from 'moment';
import { Parser } from 'json2csv';
import { DatabaseService, ExportService } from '~common/services';
import { Sensor } from '~common/services/Database';

const BREACH_CONFIG_REPORT = `
select description "Breach Name", duration / 60000 "Number of Minutes", 
case when id = "HOT_BREACH" or id = "COLD_BREACH" then "Continuous" else "Cumulative" end as "Breach Type",
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then minimumTemperature else maximumTemperature end as Temperature,
case when id = "HOT_BREACH" or id ="HOT_CUMULATIVE" then "Max" else "Min" end as Direction
from temperaturebreachconfiguration
`;

const BREACH_REPORT = `
select (select "Continuous") "Breach Type",
tbc.description "Breach Name",
datetime(startTimestamp, "unixepoch", "localtime") "Start date",
coalesce(datetime(endTimestamp, "unixepoch", "localtime"), datetime("now", "localtime")) as "End date",
(coalesce(endTimestamp, strftime("%s", "now")) - startTimestamp) / 60 "Exposure Duration (minutes)",
max(temperature) as "Max Temp",
min(temperature) as "Min Temp"
from temperaturebreach tb
join temperaturelog tl on tl.temperatureBreachId = tb.id
left join temperaturebreachconfiguration tbc on temperatureBreachConfigurationId = tb.temperatureBreachConfigurationId
where tb.sensorId = ?
group by tb.id
`;

const REPORT = `
select datetime(s.programmedDate, "unixepoch", "localtime") "Programmed On", datetime(max(min(tl.timestamp),s.logDelay),"unixepoch","localtime") "Logging Start", s.logInterval / 60 "Logging Interval"
from sensor s
left join temperaturelog tl on tl.sensorId = s.id
where s.id = ?
`;

const LOGS_REPORT = `
with cumulativeBreachFields as (
  select *, (select case when sum(logInterval) * 1000 >= (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE')  then 1 else 0 end as hasHotCumulative from temperaturelog where temperature >= hotCumulativeMinThreshold and temperature <= hotCumulativeMaxThreshold and sensorId = ?) as hasHotCumulative,
  (select case when sum(logInterval) *1000 >= (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') then 1 else 0 end as hasColdCumulative from temperaturelog where temperature >= coldCumulativeMinThreshold and temperature <= coldCumulativeMaxThreshold and sensorId = ?) as hasColdCumulative
  from ( 
       select (select maximumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeDuration,
      (select maximumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as coldCumulativeDuration
  )
  )
  
  select case 
  when (select hasHotCumulative from cumulativeBreachFields) = 1 and temperature >= (select hotCumulativeMinThreshold from cumulativeBreachFields) and temperature <= (select hotCumulativeMaxThreshold from cumulativeBreachFields) then "Hot" 
  when (select hasColdCumulative from cumulativeBreachFields) = 1 and temperature >= (select coldCumulativeMinThreshold from cumulativeBreachFields) and temperature <= (select coldCumulativeMaxThreshold from cumulativeBreachFields) then "Cold"
  else "x" end as "Is cumulative breach",
  datetime(timestamp,"unixepoch","localtime") Timestamp,
  temperature Temperature,
  tl.logInterval / 60 "Logging Interval (Minutes)",
  case when tbc.id = "HOT_BREACH" then "Hot" when tbc.id = "COLD_BREACH" then "Cold" else "" end as "Is continuous breach"
  from temperaturelog tl
  left join temperatureBreach tb on tb.id = tl.temperatureBreachId
  left join temperaturebreachconfiguration tbc on tbc.id = tb.temperatureBreachConfigurationId
  
where tl.sensorId = ?
`;

const STATS = `
with cumulativeBreachFields as (
  select *, (select case when sum(logInterval) >= hotCumulativeDuration then 1 else 0 end as hasHotCumulative from temperaturelog where temperature >= hotCumulativeMinThreshold and temperature <= hotCumulativeMaxThreshold and sensorId = ?) as hasHotCumulative,
  (select case when sum(logInterval) >= coldCumulativeDuration then 1 else 0 end as hasColdCumulative from temperaturelog where temperature >= coldCumulativeMinThreshold and temperature <= coldCumulativeMaxThreshold and sensorId = ?) as hasColdCumulative
  from ( 
       select (select maximumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeDuration,
      (select maximumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMaxThreshold,
      (select minimumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMinThreshold,
      (select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as coldCumulativeDuration
  )
  )

select max(temperature) "Max Temperature", min(temperature) "Min Temperature",
cbf.hasHotCumulative + cbf.hasColdCumulative as "Number of cumulative breaches",
(select count(*) from temperaturebreach where sensorid = ?) as "Number of continuous breaches"
from temperaturelog
left join cumulativeBreachFields cbf
where sensorid = ?
group by sensorid`;

const specialChars = /[\/\?<>\\:\*\|":]/g;
const apparentlyTheseOnesAlso = /[\x00-\x1f\x80-\x9f]/g;
const andTheseOnes = /^\.+$/;

const sanitize = (input: string, replacement = '') =>
  input
    .replace(specialChars, replacement)
    .replace(apparentlyTheseOnesAlso, replacement)
    .replace(andTheseOnes, replacement)
    .split('')
    .splice(0, 255)
    .join('');

enum SensorStatsReportKey {
  MaxTemperature = 'Max Temperature',
  MinTemperature = 'Min Temperature',
  NumberOfCumulativeBreaches = 'Number of cumulative breaches',
  NumberOfContinuousBreaches = 'Number of continuous breaches',
}

type SensorStatsReportShape = {
  [SensorStatsReportKey.MaxTemperature]: number;
  [SensorStatsReportKey.MinTemperature]: number;
  [SensorStatsReportKey.NumberOfContinuousBreaches]: number;
  [SensorStatsReportKey.NumberOfCumulativeBreaches]: number;
};

enum TemperatureLogsReportKey {
  IsCumulativeBreach = 'Is cumulative breach',
  Timestamp = 'Timestamp',
  Temperature = 'Temperature',
  LoggingInterval = 'Logging Interval (Minutes)',
  IsContinuousBreach = 'Is continuous breach',
}

type TemperatureLogsReportShape = {
  [TemperatureLogsReportKey.IsCumulativeBreach]: 'Hot' | 'Cold' | 'x';
  [TemperatureLogsReportKey.Timestamp]: number;
  [TemperatureLogsReportKey.Temperature]: number;
  [TemperatureLogsReportKey.LoggingInterval]: number;
  [TemperatureLogsReportKey.IsContinuousBreach]: 'Hot' | 'Cold' | '';
};

enum SensorReportKey {
  ProgrammedOn = 'Programmed On',
  LoggingStart = 'Logging Start',
  LoggingInterval = 'Logging Interval',
}

type SensorReportShape = {
  [SensorReportKey.ProgrammedOn]: string;
  [SensorReportKey.LoggingStart]: string;
  [SensorReportKey.LoggingInterval]: number;
};

enum BreachReportKey {
  BreachType = 'Breach Type',
  BreachName = 'Breach Name',
  StartDate = 'Start date',
  EndDate = 'End date',
  ExposureDuration = 'Exposure Duration (minutes)',
  MaxTemperature = 'Max Temp',
  MinTemperature = 'Min Temp',
}

type BreachReportShape = {
  [BreachReportKey.BreachType]: 'Continuous';
  [BreachReportKey.BreachName]: string;
  [BreachReportKey.StartDate]: string;
  [BreachReportKey.EndDate]: string;
  [BreachReportKey.ExposureDuration]: number;
  [BreachReportKey.MaxTemperature]: number;
  [BreachReportKey.MinTemperature]: number;
};

enum BreachConfigReportKey {
  BreachName = 'Breach Name',
  NumberOfMinutes = 'Number of Minutes',
  BreachType = 'Breach Type',
  Temperature = 'Temperature',
  Direction = 'Direction',
}

type BreachConfigReportShape = {
  [BreachConfigReportKey.BreachName]: string;
  [BreachConfigReportKey.NumberOfMinutes]: number;
  [BreachConfigReportKey.BreachType]: 'Continuous' | 'Cumulative';
  [BreachConfigReportKey.Temperature]: number;
  [BreachConfigReportKey.Direction]: 'Max' | 'Min';
};

enum GeneralReportKey {
  'Timezone' = 'Timezone',
  'Device' = 'Device',
  'SensorName' = 'Sensor Name',
  'ExportedBy' = 'Exported By',
  'JobDescription' = 'Job description',
}

type GeneralReportShape = {
  [GeneralReportKey.Timezone]: string;
  [GeneralReportKey.Device]: string;
  [GeneralReportKey.SensorName]: string;
  [GeneralReportKey.ExportedBy]: string;
  [GeneralReportKey.JobDescription]: string;
};

export class ReportManager {
  databaseService: DatabaseService;
  exportService: ExportService;
  deviceFeatureService: any;

  constructor(
    databaseService: DatabaseService,
    exportService: ExportService,
    deviceFeatureService: any
  ) {
    this.databaseService = databaseService;
    this.exportService = exportService;
    this.deviceFeatureService = deviceFeatureService;
  }

  getStats = async (id: string): Promise<SensorStatsReportShape> => {
    return this.databaseService.query(STATS, [id, id, id, id]);
  };

  getSensorReport = async (id: string): Promise<SensorReportShape> => {
    return this.databaseService.query(REPORT, [id]);
  };

  getLogsReport = async (id: string): Promise<TemperatureLogsReportShape> => {
    return this.databaseService.query(LOGS_REPORT, [id, id, id]);
  };

  getBreachReport = async (id: string): Promise<BreachReportShape> => {
    return this.databaseService.query(BREACH_REPORT, [id]);
  };

  breachConfigReport = async (): Promise<BreachConfigReportShape> => {
    return this.databaseService.query(BREACH_CONFIG_REPORT);
  };

  writeLogFile = async (
    sensor: Sensor,
    sensorReport: SensorReportShape,
    sensorStats: SensorStatsReportShape,
    logsReport: TemperatureLogsReportShape,
    breachReport: BreachReportShape,
    breachConfigReport: BreachConfigReportShape,
    username: string,
    comment: string
  ): Promise<string> => {
    let csv = '';

    const generalReport: GeneralReportShape = {
      [GeneralReportKey.Timezone]: this.deviceFeatureService.getDeviceTimezone(),
      [GeneralReportKey.Device]: this.deviceFeatureService.getDeviceModel(),
      [GeneralReportKey.SensorName]: sensor.name ?? sensor.macAddress,
      [GeneralReportKey.ExportedBy]: username,
      [GeneralReportKey.JobDescription]: comment,
    };
    const generalReportParser = new Parser({ fields: Object.values(GeneralReportKey) });

    try {
      csv += `${generalReportParser.parse(generalReport)} \n\n`;
    } catch (e) {}

    const sensorReportParser = new Parser<SensorReportShape>({
      fields: Object.values(SensorReportKey),
    });

    try {
      csv += `LAST PROGRAMMED\n${sensorReportParser.parse(sensorReport)}\n\n`;
    } catch (e) {}

    const breachConfigReportParser = new Parser({ fields: Object.values(BreachConfigReportKey) });

    try {
      csv += `BREACH CONFIGURATIONS\n${breachConfigReportParser.parse(breachConfigReport)}\n\n`;
    } catch (e) {}

    const sensorStatsParser = new Parser({ fields: Object.values(SensorStatsReportKey) });

    try {
      csv += `STATISTICS\n${sensorStatsParser.parse(sensorStats)}\n\n`;
    } catch (e) {}

    const breachReportParser = new Parser({ fields: Object.values(BreachReportKey) });
    try {
      csv += `BREACHES\n${breachReportParser.parse(breachReport)}\n\n`;
    } catch (e) {}

    const logReportParser = new Parser({ fields: Object.values(TemperatureLogsReportKey) });

    try {
      csv += `LOGS\n${logReportParser.parse(logsReport)}`;
    } catch (e) {}

    const directory = '/Download/cce';
    const now = moment().format('DD-MM-YYYY-HHmm');

    const file = `/${sanitize(`${now}-${sensor.name}`)}.csv`;
    const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}`;

    try {
      await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
      await RNFS.writeFile(path, csv, 'utf8');

      return path;
    } catch (e) {}

    return path;
  };

  emailLogFile = async (
    sensor: Sensor,
    sensorReport: SensorReportShape,
    sensorStats: SensorStatsReportShape,
    logsReport: TemperatureLogsReportShape,
    breachReport: BreachReportShape,
    breachConfigReport: BreachConfigReportShape,
    username: string,
    comment: string
  ): Promise<string> => {
    try {
      const path = await this.writeLogFile(
        sensor,
        sensorReport,
        sensorStats,
        logsReport,
        breachReport,
        breachConfigReport,
        username,
        comment
      );
      Mailer.mail(
        {
          subject: `Temperature log report for ${
            sensor.name ?? sensor.macAddress
          } from ${username}`,
          body: comment,
          attachments: [{ path, type: 'csv' }],
        },
        () => {}
      );

      return path;
    } catch (e) {
      return 'Uh oh';
    }
  };
}
