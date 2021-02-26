import moment from 'moment';
import { classToPlain } from 'class-transformer';
import { ENTITIES } from '~constants';

const SENSOR_STATE = `
with breach as (
  select (select count(*) > 0
  from temperaturebreach tb
  where tb.acknowledged = 0 and sensorid = ?
  and temperaturebreachconfigurationid = "HOT_BREACH") hasHotBreach,
  (select count(*) > 0
  from temperaturebreach tb
  where tb.acknowledged = 0 and sensorid = ?
  and temperaturebreachconfigurationid = "COLD_BREACH") hasColdBreach
  )
  
  SELECT s.id id, (select hasHotBreach from breach) hasHotBreach, (select hasColdBreach from breach) hasColdBreach,
  s.macAddress macAddress,
  s.logInterval logInterval,
  s.name        name,
  s.logDelay    logDelay,
  mostRecentLogTimestamp,
  firstTimestamp,
  coalesce(numberOfLogs,0) numberOfLogs,
  currentTemperature,
  CASE when mostRecentLogTimestamp - firstTimestamp > (3 * 24 * 60 * 60) then mostRecentLogTimestamp - 24 * 3 * 60 * 60 else firstTimestamp end as minChartTimestamp,
  CASE
  WHEN endTimestamp IS NULL AND temperatureBreachConfigurationId = 'HOT_BREACH' THEN 1 ELSE 0 END AS isInHotBreach,
  CASE WHEN endTimestamp IS NULL AND temperatureBreachConfigurationId = 'COLD_BREACH' THEN 1 ELSE 0 END AS isInColdBreach
  FROM      sensor s OUTER
  
  left JOIN
  (
    SELECT  max(timestamp) mostRecentLogTimestamp,
            coalesce(min(timestamp), 0) firstTimestamp,
            temperature    currentTemperature,
            count(*) numberOfLogs,
            tl.sensorid,
            *
    FROM temperaturelog tl 
    LEFT OUTER JOIN
      (
        SELECT   max(startTimestamp) startTimestamp,
        temperatureBreachConfigurationId,
        endTimestamp,
        sensorid
        FROM temperaturebreach tb
        GROUP BY sensorid
  
      ) tb
    ON tl.sensorid = tb.sensorid
    GROUP BY tl.sensorid
    order by timestamp
  ) logs
  ON logs.sensorid = s.id 
  where s.id = ?
`;

const MOST_RECENT_TIMESTAMP = `
select coalesce(max(timestamp), 0) mostRecentTimestamp
from temperaturelog
where sensorid = ?
`;

const NEXT_POSSIBLE_LOG_TIME = `
select max(coalesce(s.logDelay, 0), coalesce(mostRecentTimestamp,0)+s.logInterval) as nextTime
from sensor s
left outer join(
select coalesce(max(timestamp), 0) mostRecentTimestamp
from temperaturelog)
where s.id = ?
`;

const CAN_DOWNLOAD = `
select coalesce(s.logDelay,0) logDelay, s.logInterval + coalesce(max(tl.timestamp),0) nextPossibleLogTime
from sensor s
left outer join temperaturelog tl on s.id = tl.sensorid
where s.id = ?
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
  else "" end as "Is cumulative breach",
  datetime(timestamp,"unixepoch","localtime") Timestamp,
  temperature Temperature,
  tl.logInterval / 60 "Logging Interval (Minutes)",
  case when tbc.id = "HOT_BREACH" then "Hot" when tbc.id = "COLD_BREACH" then "Cold" else "" end as "Is continuous breach"
  from temperaturelog tl
  left join temperatureBreach tb on tb.id = tl.temperatureBreachId
  left join temperaturebreachconfiguration tbc on tbc.id = tb.temperatureBreachConfigurationId
  where tl.sensorId = ?
  order by tl.timestamp
`;

const REPORT = `
select datetime(s.programmedDate, "unixepoch", "localtime") "Programmed On", datetime(max(min(tl.timestamp),s.logDelay),"unixepoch","localtime") "Logging Start", s.logInterval / 60 "Logging Interval"
from sensor s
left join temperaturelog tl on tl.sensorId = s.id
where s.id = ?
`;

export class SensorManager {
  constructor(dbService, utils) {
    this.databaseService = dbService;
    this.utils = utils;
  }

  upsert = async (...params) => {
    return this.databaseService.upsert(ENTITIES.SENSOR, ...params);
  };

  getAll = async () => {
    return this.databaseService.getAll(ENTITIES.SENSOR);
  };

  getSensor = async macAddress => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { macAddress });

    return sensor[0];
  };

  getNextPossibleLogTime = async id => {
    const result = await this.databaseService.query(NEXT_POSSIBLE_LOG_TIME, [id]);

    const { nextPossibleLogTime = 0 } = result[0] ?? {};
    return nextPossibleLogTime;
  };

  getMostRecentLogTime = async id => {
    const result = await this.databaseService.query(MOST_RECENT_TIMESTAMP, [id]);

    const { mostRecentTimestamp = 0 } = result[0] ?? {};
    return mostRecentTimestamp;
  };

  getLogInterval = async id => {
    const sensor = await this.getSensorById(id);
    const { logInterval } = sensor ?? {};
    return logInterval;
  };

  getCanDownload = async id => {
    const result = await this.databaseService.query(CAN_DOWNLOAD, [id]);
    const { logDelay, nextPossibleLogTime } = result[0];
    const now = moment().unix();

    const canDownloadLogs = now >= logDelay && nextPossibleLogTime <= now;

    return [canDownloadLogs];
  };

  getSensorById = async id => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { id });
    return classToPlain(sensor[0]);
  };

  getSensorByMac = async macAddress => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { macAddress });
    return sensor[0];
  };

  updateLastDownloadTime = async sensor => {
    const { id, logInterval } = sensor;
    const lastDownloadTime = moment().unix();
    const nextDownloadTime = moment().add(logInterval, 's').unix();

    return this.upsert({ id, lastDownloadTime, nextDownloadTime });
  };

  getSensorState = async sensorId => {
    const result = await this.databaseService.query(SENSOR_STATE, [sensorId, sensorId, sensorId]);
    const resultTwo = await this.databaseService.query(
      'select s.batteryLevel batteryLevel, temperature as currentTemperature from sensor s left join temperaturelog tl on tl.sensorid = s.id where s.id = ? order by timestamp desc limit 1',
      [sensorId]
    );

    const { batteryLevel, currentTemperature = 'N/A' } = resultTwo[0] ?? {};

    return {
      ...result[0],
      currentTemperature,
      batteryLevel,
      from: result[0].minChartTimestamp,
      to: result[0].mostRecentLogTimestamp,
      possibleFrom: result[0].firstTimestamp,
      possibleTo: result[0].mostRecentLogTimestamp,
    };
  };

  getSensors = async () => {
    return this.getAll();
  };

  getTemperatureBreachConfigs = async () => {
    return this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  };

  // eslint-disable-next-line class-methods-use-this
  createBreachConfigurationJoinRecord = async (sensor, temperatureBreachConfiguration) => {
    const id = this.utils.uuid();
    const joinRecord = {
      id,
      sensorId: sensor.id,
      breachConfigurationId: temperatureBreachConfiguration.id,
    };

    return joinRecord;
  };

  addNewSensor = async (macAddress, logInterval, logDelay, batteryLevel) => {
    const id = this.utils.uuid();
    return this.upsert({
      logInterval,
      macAddress,
      id,
      batteryLevel,
      logDelay,
      programmedDate: moment().unix(),
    });
  };

  updateField = async (id, key, value) => {
    return this.upsert({ id, [key]: value });
  };

  updateName = async (id, name) => {
    return this.upsert({ id, name });
  };

  updateLogDelay = async (id, logDelay) => {
    return this.upsert({ id, logDelay });
  };

  updateLogInterval = async (id, logInterval) => {
    return this.upsert({ id, logInterval });
  };

  updateBatteryLevel = async (id, batteryLevel) => {
    return this.upsert({ id, batteryLevel });
  };

  getSensorReport = async id => {
    return this.databaseService.query(REPORT, [id]);
  };

  getStats = async id => {
    return this.databaseService.query(STATS, [id, id, id, id]);
  };

  getLogsReport = async id => {
    return this.databaseService.query(LOGS_REPORT, [id, id, id]);
  };
}
