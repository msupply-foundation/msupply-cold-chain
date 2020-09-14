const CUMULATIVE_EXPOSURE = `
select *, sum(logInterval), max(temperature) maximumTemperature,
sum(logInterval) duration,
min(temperature) minimumTemperature,
case when min(temperature) >= hotCumulativeMinThreshold and sum(logInterval) * 1000 >= hotCumulativeDuration then 1 else 0 end as isHotCumulative,
case when max(temperature) <= coldCumulativeMaxThreshold and sum(logInterval) * 1000 >= coldCumulativeDuration then 1 else 0 end as isColdCumulative
from (
select temperature,
logInterval,
(select maximumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMaxThreshold,
(select minimumTemperature from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeMinThreshold,
(select duration from temperaturebreachconfiguration where id = 'HOT_CUMULATIVE') as hotCumulativeDuration,
(select maximumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMaxThreshold,
(select minimumTemperature from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeMinThreshold,
(select duration from temperaturebreachconfiguration where id = 'COLD_CUMULATIVE') as coldCumulativeDuration
from temperaturelog
where ((temperature between hotCumulativeMinThreshold and hotCumulativeMaxThreshold) 
or (temperature between coldCumulativeMinThreshold and coldCumulativeMaxThreshold))
and (timestamp >= ? and timestamp <= ?)
and sensorId = ?
)
group by temperature >= hotCumulativeMinThreshold
`;

export class CumulativeBreachManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  getCumulativeExposure = async (from, to, sensorId) => {
    const manager = await this.databaseService.getEntityManager();
    const result = await manager.query(CUMULATIVE_EXPOSURE, [from, to, sensorId]);

    const lookup = result.reduce((acc, value) => {
      if (value.isHotCumulative) return { ...acc, hotCumulative: value };
      if (value.isColdCumulative) return { ...acc, coldCumulative: value };
      return acc;
    }, {});

    return lookup;
  };
}
