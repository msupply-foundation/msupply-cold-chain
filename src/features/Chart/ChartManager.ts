import { DatabaseService } from '../../common/services';

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

export interface ChartDataPoint {
  temperature: number;
  timestamp: number;
}

export interface ChartTimestamp {
  from?: number;
  to?: number;
}

export class ChartManager {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  getLogs = async (
    from: number,
    to: number,
    sensorId: string,
    maxPoints: number
  ): Promise<ChartDataPoint[]> => {
    return this.databaseService.query(GET_CHART_DATA, [
      sensorId,
      from,
      to,
      maxPoints,
      from,
      to,
      sensorId,
    ]);
  };

  getChartTimestamps = async (sensorId: string): Promise<ChartTimestamp> => {
    const [result = {}] = await this.databaseService.query(GET_CHART_TIMESTAMPS, [sensorId]);
    return result;
  };
}
