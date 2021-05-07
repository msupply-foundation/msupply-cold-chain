import RNFS from 'react-native-fs';
import Mailer from 'react-native-mail';
import moment from 'moment';
import { Parser } from 'json2csv';
import { ENTITIES } from '../../common/constants';

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

export class ReportManager {
  constructor(databaseService, exportService, deviceFeatureService) {
    this.databaseService = databaseService;
    this.exportService = exportService;
    this.deviceFeatureService = deviceFeatureService;
  }

  getSensorById = async id => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { id });
    return sensor[0];
  };

  getStats = async id => {
    return this.databaseService.query(STATS, [id, id, id, id]);
  };

  getSensorReport = async id => {
    return this.databaseService.query(REPORT, [id]);
  };

  getLogsReport = async id => {
    return this.databaseService.query(LOGS_REPORT, [id, id, id]);
  };

  getBreachReport = async id => {
    return this.databaseService.query(BREACH_REPORT, [id]);
  };

  breachConfigReport = async () => {
    return this.databaseService.query(BREACH_CONFIG_REPORT);
  };

  writeLogFile = async (
    sensor,
    sensorReport,
    sensorStats,
    logsReport,
    breachReport,
    breachConfigReport,
    username,
    comment
  ) => {
    let csv = '';

    const generalReportFields = [
      'Timezone',
      'Device',
      'Sensor Name',
      'Exported By',
      'Job description',
    ];
    const generalReport = {
      Timezone: this.deviceFeatureService.getDeviceTimezone(),
      Device: this.deviceFeatureService.getDeviceModel(),
      'Sensor Name': sensor.name ?? sensor.macAddress,
      'Exported By': username,
      'Job description': comment,
    };
    const generalReportParser = new Parser({ fields: generalReportFields });
    try {
      csv += `${generalReportParser.parse(generalReport)} \n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const sensorReportFields = ['Programmed On', 'Logging Start', 'Logging Interval'];
    const sensorReportParser = new Parser(sensorReportFields);

    try {
      csv += `LAST PROGRAMMED\n${sensorReportParser.parse(sensorReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const breachConfigReportFields = [
      'Breach Type',
      'Breach Name',
      'Number of Minutes',
      'Temperature',
      'Direction',
    ];
    const breachConfigReportParser = new Parser(breachConfigReportFields);

    try {
      csv += `BREACH CONFIGURATIONS\n${breachConfigReportParser.parse(breachConfigReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const sensorStatsFields = [
      'Max Temperature',
      'Min Temperature',
      'Number of continuous breaches',
    ];
    const sensorStatsParser = new Parser({ fields: sensorStatsFields });

    try {
      csv += `STATISTICS\n${sensorStatsParser.parse(sensorStats)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const breachReportFields = [
      'Breach Type',
      'Breach Name',
      'Start',
      'End',
      'Exposure Duration (minutes)',
      'Min Temp',
      'Max Temp',
    ];
    const breachReportParser = new Parser({ fields: breachReportFields });
    try {
      csv += `BREACHES\n${breachReportParser.parse(breachReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const logReportFields = [
      'Timestamp',
      'Temperature',
      'Is cumulative breach',
      'Is continuous breach',
      'Logging Interval (Minutes)',
    ];

    const logReportParser = new Parser({ fields: logReportFields });

    try {
      csv += `LOGS\n${logReportParser.parse(logsReport)}`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const directory = '/Download/cce';
    const now = moment().format('DD-MM-YYYY-HHmm');
    const file = `/${now}.csv`;

    const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}`;

    try {
      await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
      await RNFS.writeFile(path, csv, 'utf8');
      return path;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    return null;
  };

  emailLogFile = async (
    sensor,
    sensorReport,
    sensorStats,
    logsReport,
    breachReport,
    breachConfigReport,
    username,
    comment
  ) => {
    let csv = '';

    const generalReportFields = [
      'Timezone',
      'Device',
      'Sensor Name',
      'Exported By',
      'Exported On',
      'Job description',
    ];
    const generalReport = {
      Timezone: this.deviceFeatureService.getDeviceTimezone(),
      Device: this.deviceFeatureService.getDeviceModel(),
      'Sensor Name': sensor.name ?? sensor.macAddress,
      'Exported By': username,
      'Exported On': moment().format('YYYY-MM-DD HH:mm:ss'),
      'Job description': comment,
    };
    const generalReportParser = new Parser({ fields: generalReportFields });
    try {
      csv += `${generalReportParser.parse(generalReport)} \n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const sensorReportFields = ['Programmed On', 'Logging Start', 'Logging Interval'];
    const sensorReportParser = new Parser(sensorReportFields);

    try {
      csv += `LAST PROGRAMMED\n${sensorReportParser.parse(sensorReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const breachConfigReportFields = [
      'Breach Type',
      'Breach Name',
      'Number of Minutes',
      'Temperature',
      'Direction',
    ];
    const breachConfigReportParser = new Parser(breachConfigReportFields);

    try {
      csv += `BREACH CONFIGURATIONS\n${breachConfigReportParser.parse(breachConfigReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const sensorStatsFields = [
      'Max Temperature',
      'Min Temperature',
      'Number of continuous breaches',
    ];
    const sensorStatsParser = new Parser({ fields: sensorStatsFields });

    try {
      csv += `STATISTICS\n${sensorStatsParser.parse(sensorStats)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const breachReportFields = [
      'Breach Type',
      'Breach Name',
      'Start date',
      'End date',
      'Exposure Duration (minutes)',
      'Min Temp',
      'Max Temp',
    ];
    const breachReportParser = new Parser({ fields: breachReportFields });
    try {
      csv += `BREACHES\n${breachReportParser.parse(breachReport)}\n\n`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const logReportFields = [
      'Timestamp',
      'Temperature',
      'Is cumulative breach',
      'Is continuous breach',
      'Logging Interval (Minutes)',
    ];

    const logReportParser = new Parser({ fields: logReportFields });

    try {
      csv += `LOGS\n${logReportParser.parse(logsReport)}`;
      // eslint-disable-next-line no-empty
    } catch (e) {}

    const directory = '/Download/cce';
    const now = moment().format('DD-MM-YYYY-HHmm:ss');
    const file = `/${now}-${sensor.name}.csv`;

    const path = `${RNFS.ExternalStorageDirectoryPath}${directory}${file}`;

    try {
      await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}${directory}`);
      await RNFS.writeFile(path, csv, 'utf8');

      // eslint-disable-next-line no-empty
    } catch (e) {}

    Mailer.mail(
      {
        subject: `Temperature log report for ${sensor.name ?? sensor.macAddress} from ${username}`,
        body: comment,
        attachments: [{ path, type: 'csv' }],
      },
      () => {}
    );

    return path;
  };
}
