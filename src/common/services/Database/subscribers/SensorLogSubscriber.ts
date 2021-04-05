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
  import { ENTITIES } from '../../../constants';
  
  @EventSubscriber()
  class SensorLogSubscriber implements EntitySubscriberInterface {
    public listenTo() {
      return SensorLog;
    }
  
    @AfterInsert()
    public async afterInsert(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.SENSOR_LOG,
        payload: JSON.stringify(entity),
      });
    }
  
    @AfterUpdate()
    public async afterUpdate(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.SENSOR_LOG,
        payload: JSON.stringify(entity),
      });
    }
  }
  
  export { SensorLogSubscriber };
  