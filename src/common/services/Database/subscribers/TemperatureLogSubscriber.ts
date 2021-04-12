/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EventSubscriber,
  EntitySubscriberInterface,
  AfterUpdate,
  AfterInsert,
  UpdateEvent,
  InsertEvent,
} from 'typeorm/browser';

import { TemperatureLog } from '../entities';

import { SyncService } from '../../SyncService';

@EventSubscriber()
class TemperatureLogSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return TemperatureLog;
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
    return this.updateSyncQueue(event);
  }

  @AfterUpdate()
  public async afterUpdate(event: UpdateEvent<any>) {
    return this.updateSyncQueue(event);
  }
}

export { TemperatureLogSubscriber };
