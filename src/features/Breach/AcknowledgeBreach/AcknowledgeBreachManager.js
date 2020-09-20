import { IsNull, Not } from 'typeorm/browser';
import { ENTITIES } from '~constants';

export class AcknowledgeBreachManager {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  getUnacknowledged = async sensorId => {
    return this.databaseService.queryWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { sensorId, endTimestamp: Not(IsNull()), acknowledged: false },
    });
  };

  acknowledge = async breaches => {
    const acknowledged = breaches.map(breach => ({ ...breach, acknowledged: true }));
    return this.databaseService.upsert(ENTITIES.TEMPERATURE_BREACH, acknowledged);
  };
}
