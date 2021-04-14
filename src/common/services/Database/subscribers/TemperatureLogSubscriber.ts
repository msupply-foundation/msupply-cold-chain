/* istanbul ignore file */

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
  public static listenTo(): typeof TemperatureLog {
    return TemperatureLog;
  }

  public static async updateSyncQueue(event: InsertEvent<TemperatureLog> | UpdateEvent<TemperatureLog>): Promise<void> {
    const { entity, manager, metadata } = event;
    
    const { id } = entity;
    const { tableName } = metadata;
    
    const payload = JSON.stringify(entity);

    new SyncService(manager).log(id, tableName, payload);
  }

  @AfterInsert()
  public static async afterInsert(event: InsertEvent<TemperatureLog>): Promise<void> {
    return TemperatureLogSubscriber.updateSyncQueue(event);
  }

  @AfterUpdate()
  public static async afterUpdate(event: UpdateEvent<TemperatureLog>): Promise<void> {
    return TemperatureLogSubscriber.updateSyncQueue(event);
  }
}

export { TemperatureLogSubscriber };
