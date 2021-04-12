/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
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

  public async updateSyncQueue(event: InsertEvent<any> | UpdateEvent<any>) {
    const { entity, manager, metadata } = event;
    
    const { id } = entity;
    const { tableName } = metadata;
    
    const payload = JSON.stringify(entity);

    new SyncService(manager).log(id, tableName, payload);
  }

  @AfterInsert()
  public async afterInsert(event: InsertEvent<any>) {
    this.updateSyncQueue(event);
  }

  @AfterUpdate()
  public async afterUpdate(event: UpdateEvent<any>) {
    this.updateSyncQueue(event);
  }
}

export { SensorSubscriber };
