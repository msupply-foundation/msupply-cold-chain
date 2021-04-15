/* istanbul ignore file */

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
  public static listenTo(): typeof Sensor {
    return Sensor;
  }

  public static async updateSyncQueue(event: InsertEvent<Sensor> | UpdateEvent<Sensor>): Promise<void> {
    const { entity, manager, metadata } = event;
    
    const { id } = entity;
    const { tableName } = metadata;
    
    const payload = JSON.stringify(entity);

    new SyncService(manager).log(id, tableName, payload);
  }

  @AfterInsert()
  public static async afterInsert(event: InsertEvent<Sensor>): Promise<void> {
    SensorSubscriber.updateSyncQueue(event);
  }

  @AfterUpdate()
  public static async afterUpdate(event: UpdateEvent<Sensor>): Promise<void> {
    SensorSubscriber.updateSyncQueue(event);
  }
}

export { SensorSubscriber };
