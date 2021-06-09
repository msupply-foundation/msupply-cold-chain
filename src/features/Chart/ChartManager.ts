import { DatabaseService } from '~common/services';
import { ById } from '~common/types/common';

enum ChartDataQueryKey {
  timestamp = 'timestamp',
  temperature = 'temperature',
  sensorId = 'sensorId',
}

interface AllListChartDataPoint {
  [ChartDataQueryKey.timestamp]: number;
  [ChartDataQueryKey.temperature]: number;
  [ChartDataQueryKey.sensorId]: string;
}

const buildAllChartDataQuery = () => `
WITH ChartTimestamps AS (
    SELECT 
    sensorId,
    CASE
        WHEN (MAX(timestamp) - MIN(timestamp) ) > ( 24 * 3 * 60 * 60 )
        THEN MAX(timestamp) - (24 * 3 * 60 * 60) 
        ELSE MIN(timestamp)
    END fromTimestamp,
    MAX(timestamp) toTimestamp
    FROM Sensor
    LEFT JOIN TemperatureLog
    ON Sensor.id = TemperatureLog.sensorId
    GROUP BY Sensor.id
),
GroupingIntervals AS (
    SELECT sensorId, ROUND((toTimestamp - fromTimestamp) / 30) AS ChartInterval 
    FROM ChartTimestamps
),
FilteredLogs AS (
    SELECT Sensor.id ${ChartDataQueryKey.sensorId}, AVG(timestamp) ${ChartDataQueryKey.timestamp}, AVG(temperature) ${ChartDataQueryKey.temperature}
    FROM Sensor
    LEFT JOIN TemperatureLog
    ON Sensor.id = TemperatureLog.sensorId
    LEFT JOIN ChartTimestamps
    ON ChartTimestamps.sensorId = Sensor.id
    LEFT JOIN GroupingIntervals
    ON GroupingIntervals.sensorId = Sensor.id
    GROUP BY Sensor.id, ROUND(timestamp / GroupingIntervals.ChartInterval)
    HAVING Timestamp >= ChartTimestamps.fromTimestamp AND Timestamp <= ChartTimestamps.toTimestamp
)
SELECT *
FROM FilteredLogs
`;

const buildListChartDataQuery = () => `
WITH
sensors_temperature_logs AS (
    SELECT *
    FROM TemperatureLog
    WHERE sensorId = ?
),
chart_timestamps AS (
    SELECT
    CASE
        WHEN (MAX(stl.timestamp) - MIN(stl.timestamp) ) > ( 24 * 3 * 60 * 60 )
        THEN MAX(stl.timestamp) - (24 * 3 * 60 * 60) 
        ELSE MIN(stl.timestamp) 
    END fromTimestamp,
    MAX(stl.timestamp) toTimestamp
    FROM sensors_temperature_logs stl
),
    filtered_logs AS (
    SELECT
    *
    FROM sensors_temperature_logs
    JOIN chart_timestamps
    WHERE timestamp >= chart_timestamps.fromTimestamp
    AND timestamp <= chart_timestamps.toTimestamp
),
grouping_interval AS (
    SELECT ROUND((fromTimestamp - toTimestamp) / ?) AS grouping_interval 
    FROM chart_timestamps
)

SELECT
  AVG(filtered_logs.temperature) ${ChartDataQueryKey.temperature},
  AVG(filtered_logs.timestamp) ${ChartDataQueryKey.timestamp}
FROM filtered_logs
JOIN grouping_interval
GROUP BY ROUND(timestamp / grouping_interval.grouping_interval)
ORDER BY timestamp ASC
`;

const buildChartDataQuery = () => `
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
  avg(filtered_logs.temperature) ${ChartDataQueryKey.temperature},
  avg(filtered_logs.timestamp) ${ChartDataQueryKey.timestamp}
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
    maxPoints = 30
  ): Promise<ChartDataPoint[]> => {
    const query = buildChartDataQuery();
    return this.databaseService.query(query, [sensorId, from, to, maxPoints]);
  };

  getChartTimestamps = async (sensorId: string): Promise<ChartTimestamp> => {
    const [result = {}] = await this.databaseService.query(GET_CHART_TIMESTAMPS, [sensorId]);
    return result;
  };

  getListChartData = async (sensorId: string, maxPoints = 30): Promise<ChartDataPoint[]> => {
    const query = buildListChartDataQuery();
    return this.databaseService.query(query, [sensorId, maxPoints]);
  };

  // Query returns an array of { sensorId, timestamp, temperature } rows from the db.
  // Once it's returned, map it to a ById lookup.
  getAllListChartData = async (): Promise<ById<ChartDataPoint[]>> => {
    const query = buildAllChartDataQuery();
    const result: AllListChartDataPoint[] = await this.databaseService.query(query);

    const mapped = result.reduce(
      (acc: Record<string, ChartDataPoint[]>, { sensorId, temperature, timestamp }) => {
        // Search for the existing array of data points for a sensor
        const chartData: ChartDataPoint[] | undefined = acc[sensorId];

        // If there exists one, just append the data point to the array.
        if (chartData) {
          return { ...acc, [sensorId]: chartData.concat({ temperature, timestamp }) };
          // Otherwise, create a new array for the sensor ID,
        } else {
          return { ...acc, [sensorId]: [{ temperature, timestamp }] };
        }
      },
      {}
    );

    return mapped;
  };
}
