import { LogTableManager } from '~features/SensorDetail/LogTable';

const GET_LOGS = `
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
tl.timestamp between ? and ? and sensorId = ?
order by timestamp
limit ?
offset ?
`;
describe('LogTableManager: getLogs', () => {
  it('returns the logs queried for', async () => {
    const query = jest.fn(() => []);
    const dbServiceMock = { query };
    const logManager = new LogTableManager(dbServiceMock);

    await expect(logManager.getLogs(0, 0, 'a')).resolves.toEqual([]);
  });
  it('is called with the correct params', async () => {
    const query = jest.fn(() => []);
    const dbServiceMock = { query };
    const logManager = new LogTableManager(dbServiceMock);

    logManager.getLogs(0, 0, 'a');

    await expect(query).toBeCalledTimes(1);
    await expect(query).toBeCalledWith(GET_LOGS, [0, 0, 'a', 50, 0]);
  });
  it('is called with the correct pagination params', async () => {
    const query = jest.fn(() => []);
    const dbServiceMock = { query };
    const logManager = new LogTableManager(dbServiceMock);

    logManager.getLogs(0, 0, 'a', { offset: 1, limit: 2 });

    await expect(query).toBeCalledTimes(1);
    await expect(query).toBeCalledWith(GET_LOGS, [0, 0, 'a', 2, 1]);
  });
});
