import { ENTITIES } from '~constants';

export class TemperatureLogManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  getLogsForSensor = async sensorId => {
    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_LOG, {
      where: { sensorId },
      orderBy: { timestamp: 'asc' },
      take: 5000,
    });
  };

  getLogs = async (fromDate, toDate, sensorId) => {
    return (await this.databaseService.getEntityManager()).query(
      `
      select tl.id id,
      tl.timestamp timestamp,
      tl.temperature temperature,
      coalesce(b.isInHotBreach,0) isInHotBreach,
      coalesce(b.isInColdBreach,0) isInColdBreach
      from
      temperaturelog tl
      left outer join (
        select
          tb.id temperaturebreachid,
          case when tbc.id = 'HOT_BREACH' then 1 else 0 end as isInHotBreach,
          case when tbc.id = 'COLD_BREACH' then 1 else 0 end as isInColdBreach
        from
          temperaturebreach tb
          left outer join temperaturebreachconfiguration tbc on tb.temperaturebreachconfigurationid = tbc.id
      ) b on b.temperaturebreachid = tl.temperaturebreachid
      where
      tl.timestamp between ${fromDate} and ${toDate} and sensorId = '${sensorId}' limit 100

    `
    );
  };

  getChartData = async () => {
    const manager = await this.databaseService.getEntityManager();

    manager.query(
      'select timestamp / 60 * 60 * 1000 hour, timestamp, max(temperature) maxTemperature, min(temperature) minTemperature, avg(temperature) avgTemperature from temperaturelog tl group by timestamp, sensorId order by timestamp desc'
    );
  };

  getLogsPerSensor = async () => {
    const sensors = await this.databaseService.getAll(ENTITIES.SENSOR);

    const getLogsPromises = sensors.map(({ id }) => this.getLogsForSensor(id));
    const logs = await Promise.all(getLogsPromises);

    const mapped = sensors.reduce(
      (acc, { macAddress }, i) => ({ ...acc, [macAddress]: logs[i] }),
      {}
    );

    return mapped;
  };
}
