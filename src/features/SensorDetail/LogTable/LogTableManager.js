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

export class LogTableManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  getLogs = async (from, to, id, pagination = {}) => {
    const { offset = 0, limit = 50 } = pagination;
    return this.databaseService.query(GET_LOGS, [from, to, id, limit, offset]);
  };
}
