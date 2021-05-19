import { DatabaseService } from '../../common/services';

const GET_CHART_DATA = `
with filtered_logs as (
  select
    *
  from
    TemperatureLog tl
  where
    sensorid = ? and
    timestamp >= ?
    and timestamp <= ?
    
),
grouping_interval as (select round((max(filtered_logs.timestamp) - min(filtered_logs.timestamp))  / ?) as grouping_interval from filtered_logs)
select
  avg(filtered_logs.temperature) temperature,
  avg(filtered_logs.timestamp) timestamp
from filtered_logs, grouping_interval
group by round(timestamp / grouping_interval.grouping_interval)
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
    return this.databaseService.query(GET_CHART_DATA, [sensorId, from, to, maxPoints]);
  };

  getChartTimestamps = async (sensorId: string): Promise<ChartTimestamp> => {
    const [result = {}] = await this.databaseService.query(GET_CHART_TIMESTAMPS, [sensorId]);
    return result;
  };
}
