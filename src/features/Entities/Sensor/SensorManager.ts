import { UtilService } from '~services/UtilService';
import { DatabaseService, Sensor } from '~services/Database';
import moment from 'moment';
import { classToPlain } from 'class-transformer';
import { ENTITIES } from '../../../common/constants';

import { IsNull } from 'typeorm/browser';

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
  s.batteryLevel batteryLevel,
  mostRecentLogTimestamp,
  firstTimestamp,
  coalesce(numberOfLogs,0) numberOfLogs,
  currentTemperature,
  CASE when mostRecentLogTimestamp - firstTimestamp > (3 * 24 * 60 * 60) then mostRecentLogTimestamp - 24 * 3 * 60 * 60 else firstTimestamp end as minChartTimestamp,
  CASE
  WHEN endTimestamp IS NULL AND temperatureBreachConfigurationId = 'HOT_BREACH' THEN 1 ELSE 0 END AS isInHotBreach,
  CASE WHEN endTimestamp IS NULL AND temperatureBreachConfigurationId = 'COLD_BREACH' THEN 1 ELSE 0 END AS isInColdBreach
  FROM      sensor s OUTER
  LEFT JOIN (SELECT coalesce(min(timestamp), 0) firstTimestamp from temperaturelog where sensorid = ?)
  left JOIN
  (
    SELECT  max(timestamp) mostRecentLogTimestamp,
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

const CAN_DOWNLOAD = `
select coalesce(s.logDelay,0) logDelay, s.logInterval + coalesce(max(tl.timestamp),0) nextPossibleLogTime
from sensor s
left outer join temperaturelog tl on s.id = tl.sensorid
where s.id = ?
`;

export type SensorState = {
  possibleFrom: number;
  possibleTo: number;
  from: number;
  to: number;
};

export class SensorManager {
  databaseService: DatabaseService;

  utils: UtilService;

  constructor(dbService: DatabaseService, utils: UtilService) {
    this.databaseService = dbService;
    this.utils = utils;
  }

  getAll = async (): Promise<Sensor[]> => {
    return this.databaseService.queryWith(ENTITIES.SENSOR, {
      where: [{ isActive: IsNull() }, { isActive: 1 }],
    });
  };

  getSensorById = async (id: string): Promise<Sensor> => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { id });

    return classToPlain(sensor[0]) as Sensor;
  };

  getSensorByMac = async (macAddress: string): Promise<Sensor> => {
    const sensor = await this.databaseService.queryWith(ENTITIES.SENSOR, { macAddress });
    return sensor[0];
  };

  getMostRecentLogTime = async (id: string): Promise<number> => {
    const result = await this.databaseService.query(MOST_RECENT_TIMESTAMP, [id]);

    const { mostRecentTimestamp = 0 } = result[0] ?? {};
    return mostRecentTimestamp;
  };

  getCanDownload = async (id: string): Promise<boolean[]> => {
    const result = await this.databaseService.query(CAN_DOWNLOAD, [id]);
    const { logDelay, nextPossibleLogTime } = result[0];
    const now = moment().unix();

    const canDownloadLogs = now >= logDelay && nextPossibleLogTime <= now;

    return [canDownloadLogs];
  };

  addNewSensor = async (
    macAddress: string,
    logInterval: number,
    logDelay: number,
    batteryLevel: number
  ): Promise<Sensor> => {
    const id = this.utils.uuid();
    const name = macAddress;
    return this.upsert({
      name,
      logInterval,
      macAddress,
      id,
      batteryLevel,
      logDelay,
      programmedDate: moment().unix(),
    });
  };

  remove = async (id: string): Promise<Sensor> => {
    return this.databaseService.update(ENTITIES.SENSOR, id, { isActive: false });
  };

  getSensorState = async (sensorId: string): Promise<SensorState> => {
    const result = await this.databaseService.query(SENSOR_STATE, [
      sensorId,
      sensorId,
      sensorId,
      sensorId,
    ]);

    return {
      ...result[0],
      from: result[0].minChartTimestamp,
      to: result[0].mostRecentLogTimestamp,
      possibleFrom: result[0].firstTimestamp,
      possibleTo: result[0].mostRecentLogTimestamp,
    };
  };

  upsert = async (params: Partial<Sensor>): Promise<Sensor> => {
    return this.databaseService.upsert(ENTITIES.SENSOR, params);
  };

  update = async (id: string, params: Partial<Sensor>): Promise<Sensor> => {
    return this.databaseService.update(ENTITIES.SENSOR, id, params);
  };
}
