import { classToPlain } from 'class-transformer';
import { IsNull, Not } from 'typeorm/browser';
import { TemperatureBreach } from '~services/Database/entities';
import { ENTITIES } from '~common/constants';
import { DatabaseService } from '~common/services';

export class AcknowledgeBreachManager {
  databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  getUnacknowledged = async (sensorId: string): Promise<TemperatureBreach[]> => {
    const unacknowledged = await this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { sensorId, endTimestamp: Not(IsNull()), acknowledged: false },
    });

    return unacknowledged.map((breach: TemperatureBreach) => classToPlain(breach));
  };

  acknowledge = async (breaches: TemperatureBreach[]): Promise<TemperatureBreach[]> => {
    const acknowledged = breaches.map(breach => ({ ...breach, acknowledged: true }));
    const updated = await this.databaseService.upsert(ENTITIES.TEMPERATURE_BREACH, acknowledged);
    return updated.map((breach: TemperatureBreach) => classToPlain(breach));
  };
}
