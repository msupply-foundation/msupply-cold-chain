import { DatabaseService } from '../../../common/services';

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
order by timestamp desc
limit ?
offset ?
`;

export interface TemperatureLogRow {
  id: string;
  timestamp: number;
  temperature: number;
  isInHotBreach: boolean;
  isInColdBreach: boolean;
}

export interface PaginationConfig {
  offset: number;
  limit: number;
}

export class LogTableManager {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  getLogs = async (
    from: number,
    to: number,
    id: string,
    pagination: PaginationConfig
  ): Promise<TemperatureLogRow> => {
    const { offset = 0, limit = 50 } = pagination ?? {};
    return this.databaseService.query(GET_LOGS, [from, to, id, limit, offset]);
  };
}
