/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  AfterInsert,
  AfterUpdate,
} from 'typeorm/browser';

import { Sensor } from '../entities';

import { SyncService } from '../../SyncService';

@EventSubscriber()
class SensorSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return Sensor;
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

export { SensorSubscriber };
