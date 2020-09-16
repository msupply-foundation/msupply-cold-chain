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
  s.batteryLevel < 75 isLowBattery,
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

export class SensorStatusManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  getSensorStatus = async sensorId => {
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(SENSOR_STATUS, [sensorId, sensorId, sensorId]);
    const resultTwo = await manager.query(
      'select s.batteryLevel batteryLevel, temperature as currentTemperature from sensor s left join temperaturelog tl on tl.sensorid = s.id where s.id = ? order by timestamp desc limit 1',
      [sensorId]
    );

    const { batteryLevel, currentTemperature = 'N/A' } = resultTwo[0] ?? {};

    return { ...result[0], currentTemperature, batteryLevel };
  };
}
