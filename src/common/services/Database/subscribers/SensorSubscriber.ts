/* istanbul ignore file */

import {
  EventSubscriber,
  EntitySubscriberInterface,
  AfterUpdate,
  AfterInsert,
  UpdateEvent,
  InsertEvent,
} from 'typeorm/browser';

import { Sensor } from '../entities';

import { SyncQueueManager } from '../../../../features';

@EventSubscriber()
class SensorSubscriber implements EntitySubscriberInterface {
  private syncQueueManager: SyncQueueManager;

  public constructor(syncQueueManager: SyncQueueManager) {
    this.syncQueueManager = syncQueueManager;
  }

  public listenTo(): typeof Sensor {
    return Sensor;
  }

  public async updateSyncQueue(event: InsertEvent<Sensor> | UpdateEvent<Sensor>): Promise<void> {
    const { entity, metadata } = event;

    const { id } = entity;
    const { tableName } = metadata;

    const payload = JSON.stringify(entity);

    this.syncQueueManager.pushLog(id, tableName, payload);
  }

  @AfterInsert()
  public async afterInsert(event: InsertEvent<Sensor>): Promise<void> {
    return this.updateSyncQueue(event);
  }

  @AfterUpdate()
  public async afterUpdate(event: UpdateEvent<Sensor>): Promise<void> {
    return this.updateSyncQueue(event);
  }
}

export { SensorSubscriber };
