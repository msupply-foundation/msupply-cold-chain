/* eslint-disable class-methods-use-this */
/* istanbul ignore file */

import {
  EventSubscriber,
  EntitySubscriberInterface,
  AfterInsert,
  AfterUpdate,
  InsertEvent,
  UpdateEvent,
} from 'typeorm/browser';

import { TemperatureBreach, TemperatureBreachConfiguration } from '../entities';
import { SyncQueueManager } from '../../../../features';
import { ENTITIES } from '../../../constants';

@EventSubscriber()
class TemperatureBreachSubscriber implements EntitySubscriberInterface {
  private syncQueueManager: SyncQueueManager;

  public constructor(syncQueueManager: SyncQueueManager) {
    this.syncQueueManager = syncQueueManager;
  }

  public listenTo(): typeof TemperatureBreach {
    return TemperatureBreach;
  }

  public async updateSyncQueue(event: InsertEvent<TemperatureBreach> | UpdateEvent<TemperatureBreach>): Promise<void> {
    const { entity, manager, metadata } = event;

    const {
      id,
      startTimestamp,
      acknowledged,
      sensorId,
      temperatureBreachConfigurationId
    } = entity;

    const { tableName } = metadata;

    const temperatureBreachConfiguration = await manager.findOne(
      ENTITIES.TEMPERATURE_BREACH_CONFIGURATION,
      temperatureBreachConfigurationId
    ) as TemperatureBreachConfiguration;
    
    const {
      minimumTemperature: thresholdMinimumTemperature,
      maximumTemperature: thresholdMaximumTemperature,
      duration: thresholdDuration
    } = temperatureBreachConfiguration;

    const type = temperatureBreachConfiguration.id === ('HOT_BREACH' || 'HOT_CUMULATIVE')
      ? 'HOT_CONSECUTIVE'
      : 'COLD_CONSECUTIVE';

    const payload = JSON.stringify({
      id,
      startTimestamp,
      acknowledged,
      sensorId,
      thresholdMinimumTemperature,
      thresholdMaximumTemperature,
      thresholdDuration,
      type,
    });

    this.syncQueueManager.pushLog(id, tableName, payload);
  }

  @AfterInsert()
  public async afterInsert(event: InsertEvent<TemperatureBreach>): Promise<void> {
    return this.updateSyncQueue(event);
  }

  @AfterUpdate()
  public async afterUpdate(event: UpdateEvent<TemperatureBreach>): Promise<void> {
    return this.updateSyncQueue(event);
  }
}

export { TemperatureBreachSubscriber };

