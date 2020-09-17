const GET_CHART_DATA = `
select 
  avg(temperature) temperature, 
  avg(timestamp) timestamp 
from 
  temperaturelog tl 
where 
  tl.sensorid = ?
  and timestamp >= ?
  and timestamp <= ?
group by 
  round(
    tl.timestamp / (
      select 
        duration / ? as groupingInterval 
      from 
        (
          select 
            max(timestamp) - min(timestamp) duration 
          from 
            temperaturelog 
          where 
            timestamp >= ?
            and timestamp <= ?
            and sensorid = ?
        )
    )
  ) 
order by 
  timestamp asc
`;

const GET_CHART_TIMESTAMPS = `
SELECT CASE
WHEN ( Max(tl.timestamp) - Min(tl.timestamp) ) > ( 3 * 24 * 60 * 60 ) THEN max(tl.timestamp) - (24 * 3 * 60 * 60) ELSE Min(tl.timestamp) END AS "from",
Max(tl.timestamp) AS "to"
FROM   sensor s
JOIN temperaturelog tl
ON tl.sensorid = s.id
WHERE s.id = ?
GROUP  BY s.id  
`;

export class ChartManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  getLogs = async (from, to, sensorId, maxPoints) => {
    const manager = await this.databaseService.getEntityManager();
    return manager.query(GET_CHART_DATA, [sensorId, from, to, maxPoints, from, to, sensorId]);
  };

  getChartTimestamps = async sensorId => {
    const manager = await this.databaseService.getEntityManager();
    const [result = {}] = await manager.query(GET_CHART_TIMESTAMPS, [sensorId]);
    return result;
  };
}
