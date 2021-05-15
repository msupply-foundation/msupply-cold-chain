import { IsNull, Not } from 'typeorm/browser';
import { ENTITIES } from '../../../common/constants';
import { DatabaseService } from '../../../common/services';

interface TemperatureBreach {
  id: string;
  endTimestamp: number;
  startTimestamp: number;
  temperatureBreachConfigurationId: string;
  acknowledged: boolean;
  sensorId: string;
}

export class AcknowledgeBreachManager {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  getUnacknowledged = async (sensorId: string): Promise<TemperatureBreach[]> => {
    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { sensorId, endTimestamp: Not(IsNull()), handled: false },
    });
  };

  acknowledge = async (breaches: TemperatureBreach[]): Promise<TemperatureBreach[]> => {
    const acknowledged = breaches.map(breach => ({ ...breach, handled: true }));
    return this.databaseService.upsert(ENTITIES.TEMPERATURE_BREACH, acknowledged);
  };
}
