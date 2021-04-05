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

import { ENTITIES } from '../../../constants';

@EventSubscriber()
class SensorSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return Sensor;
  }

  @AfterInsert()
  public async afterInsert(event: InsertEvent<any>) {
    const { entity, manager } = event;
    manager.save(ENTITIES.SYNC_QUEUE, { type: ENTITIES.SENSOR, payload: JSON.stringify(entity) });
  }

  @AfterUpdate()
  public async afterUpdate(event: InsertEvent<any>) {
    const { entity, manager } = event;
    manager.save(ENTITIES.SYNC_QUEUE, { type: ENTITIES.SENSOR, payload: JSON.stringify(entity) });
  }
}

export { SensorSubscriber }