import { SensorStatusManager } from '~features/SensorStatus/SensorStatusManager';

const SENSOR_STATUS = `
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
  s.batteryLevel < 25 isLowBattery,
  firstTimestamp,
  coalesce(numberOfLogs,0) > 0 hasLogs,
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

describe('SensorStatusManager: ', () => {
  it('Returns sensor status', async () => {
    const query = jest.fn();
    const mockDbService = { query };

    const sensorStatusManager = new SensorStatusManager(mockDbService);
    sensorStatusManager.getSensorStatus('a');

    await expect(query).toBeCalledWith(SENSOR_STATUS, ['a', 'a', 'a', 'a']);
  });
});
