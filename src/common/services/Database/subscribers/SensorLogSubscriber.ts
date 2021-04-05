/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  AfterInsert,
  AfterUpdate,
} from 'typeorm/browser';

import { SensorLog } from '../entities';

import { SyncService } from '../../SyncService';

@EventSubscriber()
class SensorLogSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return SensorLog;
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

export { SensorLogSubscriber };
