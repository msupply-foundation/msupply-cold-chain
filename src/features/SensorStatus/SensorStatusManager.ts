import { SensorStatus, BatteryLevelThreshold } from './types';
import { DatabaseService } from '~services';
import { ById } from '~common/types/common';

enum SensorStatusQueryKey {
  ID = 'id',
  CurrentTemperature = 'currentTemperature',
  MostRecentLogTimestamp = 'mostRecentLogTimestamp',
  NumberOfLogs = 'numberOfLogs',
  FirstTimestamp = 'firstTimestamp',
  NumberOfHotBreaches = 'numberOfHotBreaches',
  NumberOfColdBreaches = 'numberOfColdBreaches',
  batteryLevel = 'batteryLevel',
}

type SensorStatusQueryResult = {
  [SensorStatusQueryKey.ID]: string;
  [SensorStatusQueryKey.CurrentTemperature]: number;
  [SensorStatusQueryKey.FirstTimestamp]: number;
  [SensorStatusQueryKey.MostRecentLogTimestamp]: number;
  [SensorStatusQueryKey.NumberOfColdBreaches]: number;
  [SensorStatusQueryKey.NumberOfHotBreaches]: number;
  [SensorStatusQueryKey.NumberOfLogs]: number;
  [SensorStatusQueryKey.batteryLevel]: number;
};

const buildSensorStatusQuery = (whereClause = 'id = ?') => `
WITH
FilteredSensorIDs as (
    SELECT id as sensorId FROM Sensor WHERE ${whereClause}
),
UnacknowledgedBreaches as (
    SELECT * 
    FROM TemperatureBreach 
    WHERE acknowledged=0
),
TemperatureLogStats as (
    SELECT sensorId, MIN(timestamp) ${SensorStatusQueryKey.FirstTimestamp}, MAX(timestamp) ${SensorStatusQueryKey.MostRecentLogTimestamp}, COUNT(*) ${SensorStatusQueryKey.NumberOfLogs}
    FROM Sensor
    JOIN TemperatureLog
    ON TemperatureLog.sensorId = Sensor.id 
    WHERE Sensor.id IN FilteredSensorIDS
    GROUP BY sensorId
),
BreachStats as (
    SELECT id sensorId, COALESCE(${SensorStatusQueryKey.NumberOfHotBreaches},0) ${SensorStatusQueryKey.NumberOfHotBreaches}, COALESCE(${SensorStatusQueryKey.NumberOfColdBreaches},0) ${SensorStatusQueryKey.NumberOfColdBreaches}
    FROM Sensor
    LEFT JOIN (SELECT sensorId, COUNT(*) ${SensorStatusQueryKey.NumberOfHotBreaches} FROM UnacknowledgedBreaches WHERE temperatureBreachConfigurationId='HOT_BREACH' GROUP BY sensorId) ${SensorStatusQueryKey.NumberOfHotBreaches}
    ON ${SensorStatusQueryKey.NumberOfHotBreaches}.sensorId = Sensor.id
    LEFT JOIN (SELECT sensorId, COUNT(*) ${SensorStatusQueryKey.NumberOfColdBreaches} FROM UnacknowledgedBreaches WHERE temperatureBreachConfigurationId='COLD_BREACH' GROUP BY sensorId) ${SensorStatusQueryKey.NumberOfColdBreaches}
    ON ${SensorStatusQueryKey.NumberOfColdBreaches}.sensorId = Sensor.id
    WHERE Sensor.id IN FilteredSensorIDs
),
CurrentStats as (
    SELECT Sensor.id sensorId, temperature ${SensorStatusQueryKey.CurrentTemperature}
    FROM Sensor
    LEFT JOIN TemperatureLog
    ON Sensor.id = TemperatureLog.sensorId
    WHERE Sensor.id IN FilteredSensorIDs
    GROUP BY Sensor.id
    HAVING timestamp = MAX(timestamp)
)

SELECT
${SensorStatusQueryKey.ID},
${SensorStatusQueryKey.CurrentTemperature},
${SensorStatusQueryKey.MostRecentLogTimestamp},
${SensorStatusQueryKey.NumberOfLogs}, 
${SensorStatusQueryKey.FirstTimestamp}, 
${SensorStatusQueryKey.NumberOfColdBreaches}, 
${SensorStatusQueryKey.NumberOfHotBreaches}, 
${SensorStatusQueryKey.batteryLevel}
FROM Sensor
LEFT JOIN TemperatureLogStats
ON TemperatureLogStats.sensorId = Sensor.id
LEFT JOIN BreachStats
ON BreachStats.sensorId = Sensor.id
LEFT JOIN CurrentStats
ON CurrentStats.sensorId = Sensor.id
WHERE Sensor.id IN FilteredSensorIDs
`;

export class SensorStatusManager {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  mapStatusQueryResult = (result: SensorStatusQueryResult): SensorStatus => {
    return {
      id: result.id,
      mostRecentLogTimestamp: result.mostRecentLogTimestamp,
      isInColdBreach: result.numberOfColdBreaches > 0,
      isInHotBreach: result.numberOfHotBreaches > 0,
      hasHotBreach: result.numberOfHotBreaches > 0,
      hasColdBreach: result.numberOfColdBreaches > 0,
      isLowBattery: result.batteryLevel < BatteryLevelThreshold.Empty,
      firstTimestamp: result.firstTimestamp,
      numberOfLogs: result.numberOfLogs,
      currentTemperature: result.currentTemperature,
      hasLogs: result.numberOfLogs > 0,
    };
  };

  getAllStatuses = async (): Promise<ById<SensorStatus>> => {
    const query = buildSensorStatusQuery('isActive = 1');
    const result = (await this.databaseService.query(query)) as SensorStatusQueryResult[];
    const mappedResults = result.map(queryResult => this.mapStatusQueryResult(queryResult));

    const indexed: ById<SensorStatus> = {};
    mappedResults.forEach(sensorStatus => {
      indexed[sensorStatus.id] = sensorStatus;
    });

    return indexed;
  };

  getSensorStatus = async (sensorId: string): Promise<SensorStatus> => {
    const query = buildSensorStatusQuery();
    const [result] = (await this.databaseService.query(query, [
      sensorId,
    ])) as SensorStatusQueryResult[];

    return this.mapStatusQueryResult(result);
  };
}
