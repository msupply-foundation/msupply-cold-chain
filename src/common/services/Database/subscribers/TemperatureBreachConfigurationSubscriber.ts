/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EntitySubscriberInterface,
  EventSubscriber,
  AfterInsert,
  InsertEvent,
  AfterUpdate,
} from 'typeorm/browser';

import { TemperatureBreachConfiguration } from '../entities';

import { SyncService } from '../../SyncService';

@EventSubscriber()
class TemperatureBreachConfigurationSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return TemperatureBreachConfiguration;
  }

  @AfterInsert()
  public async afterInsert(event: InsertEvent<any>) {
    new SyncService(event).log();
  }

  @AfterUpdate()
  public async afterUpdate(event: InsertEvent<any>) {
    new SyncService(event).log();
  }
}

export { TemperatureBreachConfigurationSubscriber };
