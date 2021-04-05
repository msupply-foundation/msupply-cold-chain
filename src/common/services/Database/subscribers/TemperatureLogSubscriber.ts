/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EventSubscriber,
  EntitySubscriberInterface,
  AfterUpdate,
  AfterInsert,
  InsertEvent,
} from 'typeorm/browser';

import { TemperatureLog } from '../entities';

import { SyncService } from '../../SyncService';

@EventSubscriber()
class TemperatureLogSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return TemperatureLog;
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

export { TemperatureLogSubscriber };
