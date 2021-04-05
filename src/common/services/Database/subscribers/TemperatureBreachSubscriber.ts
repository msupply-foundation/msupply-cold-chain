/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EventSubscriber,
  EntitySubscriberInterface,
  AfterInsert,
  AfterUpdate,
  InsertEvent,
} from 'typeorm/browser';

import { TemperatureBreach } from '../entities';

import { SyncService } from '../../SyncService';

@EventSubscriber()
class TemperatureBreachSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return TemperatureBreach;
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

export { TemperatureBreachSubscriber };
