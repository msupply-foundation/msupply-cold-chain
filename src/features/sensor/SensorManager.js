import moment from 'moment';
import { ENTITIES } from '~constants';
import { uuid } from '~services/utilities';

const SENSOR_STATE = `
SELECT s.id id,
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
          min(timestamp) firstTimestamp,
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

export class SensorManager {
  constructor(dbService) {
    this.databaseService = dbService;
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
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(NEXT_POSSIBLE_LOG_TIME, [id]);

    const { nextPossibleLogTime = 0 } = result[0] ?? {};
    return nextPossibleLogTime;
  };

  getMostRecentLogTime = async id => {
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(MOST_RECENT_TIMESTAMP, [id]);

    const { mostRecentTimestamp = 0 } = result[0] ?? {};
    return mostRecentTimestamp;
  };

  getLogInterval = async id => {
    const sensor = await this.getSensorById(id);
    const { logInterval } = sensor ?? {};
    return logInterval;
  };

  getCanDownload = async id => {
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(CAN_DOWNLOAD, [id]);
    const { logDelay, nextPossibleLogTime } = result[0];
    const now = moment().unix();

    const canDownloadLogs = now >= logDelay && nextPossibleLogTime <= now;

    return [canDownloadLogs];
  };

  getSensorById = async id => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { id });
    return sensor[0];
  };

  updateLastDownloadTime = async sensor => {
    const { id, logInterval } = sensor;
    const lastDownloadTime = moment().unix();
    const nextDownloadTime = moment().add(logInterval, 's').unix();

    return this.upsert({ id, lastDownloadTime, nextDownloadTime });
  };

  getSensorState = async sensorId => {
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(SENSOR_STATE, [sensorId]);
    const resultTwo = await manager.query(
      'select s.batteryLevel batteryLevel, temperature as currentTemperature from sensor s left join temperaturelog tl on tl.sensorid = s.id where s.id = ? order by timestamp desc limit 1',
      [sensorId]
    );

    const { batteryLevel, currentTemperature = 'N/A' } = resultTwo[0] ?? {};

    return { ...result[0], currentTemperature, batteryLevel };
  };

  getSensors = async () => {
    const manager = await this.databaseService.getEntityManager();

    return manager.query(
      `
      SELECT s.id id,
      s.macAddress macAddress,
      s.logInterval logInterval,
      s.name        name,
      s.logDelay    logDelay,
      mostRecentLogTimestamp,
      firstTimestamp,
      currentTemperature,
      CASE when mostRecentLogTimestamp - firstTimestamp > (3 * 24 * 60 * 60) then mostRecentLogTimestamp - 24 * 3 * 60 * 60 else firstTimestamp end as minChartTimestamp,
      CASE
      WHEN endTimestamp IS NULL AND temperatureBreachConfigurationId = 'HOT_BREACH' THEN 1 ELSE 0 END AS isInHotBreach,
      CASE WHEN endTimestamp IS NULL AND temperatureBreachConfigurationId = 'COLD_BREACH' THEN 1 ELSE 0 END AS isInColdBreach
      FROM      sensor s OUTER
      left JOIN
      (
        SELECT  max(timestamp) mostRecentLogTimestamp,
                min(timestamp) firstTimestamp,
                temperature    currentTemperature,
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
      ) logs
        ON logs.sensorid = s.id 
      `
    );
  };

  getTemperatureBreachConfigs = async () => {
    return this.databaseService.getAll(ENTITIES.TEMPERATURE_BREACH_CONFIGURATION);
  };

  // eslint-disable-next-line class-methods-use-this
  createBreachConfigurationJoinRecord = async (sensor, temperatureBreachConfiguration) => {
    const id = uuid();
    const joinRecord = {
      id,
      sensorId: sensor.id,
      breachConfigurationId: temperatureBreachConfiguration.id,
    };

    return joinRecord;
  };

  addNewSensor = async (macAddress, logInterval, logDelay, batteryLevel) => {
    const id = uuid();
    return this.upsert({ logInterval, macAddress, id, batteryLevel, logDelay });
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
}
