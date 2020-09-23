import { ChartManager } from '~features/Chart';

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

describe('ChartManager: getLogs', () => {
  it('Calls query with the correct params', async () => {
    const query = jest.fn(() => {});
    const mockDbService = { query };

    const chartManager = new ChartManager(mockDbService);

    const from = 0;
    const to = 0;
    const sensorId = 'a';
    const maxPoints = 0;

    chartManager.getLogs(from, to, sensorId, maxPoints);

    await expect(query).toBeCalledTimes(1);
    await expect(query).toBeCalledWith(GET_CHART_DATA, [
      sensorId,
      from,
      to,
      maxPoints,
      from,
      to,
      sensorId,
    ]);
  });
  it('Returns the logs queried for', async () => {
    const mockLogs = [{ id: 'a' }];
    const query = jest.fn(() => mockLogs);
    const mockDbService = { query };

    const chartManager = new ChartManager(mockDbService);

    const from = 0;
    const to = 0;
    const sensorId = 'a';
    const maxPoints = 0;

    await expect(chartManager.getLogs(from, to, sensorId, maxPoints)).resolves.toEqual(mockLogs);
  });
});

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

describe('ChartManager: getChartTimestamps', () => {
  it('Calls query with the correct params', async () => {
    const query = jest.fn(() => {});
    const mockDbService = { query };

    const chartManager = new ChartManager(mockDbService);

    const sensorId = 'a';

    chartManager.getChartTimestamps(sensorId);

    await expect(query).toBeCalledTimes(1);
    await expect(query).toBeCalledWith(GET_CHART_TIMESTAMPS, [sensorId]);
  });
  it('returns the timestamps queried for', async () => {
    const query = jest.fn(() => []);
    const mockDbService = { query };

    const chartManager = new ChartManager(mockDbService);

    const sensorId = 'a';

    await expect(chartManager.getChartTimestamps(sensorId)).resolves.toEqual({});
  });
});
