 /* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
    EventSubscriber,
    EntitySubscriberInterface,
    AfterUpdate,
    AfterInsert,
    InsertEvent,
  } from 'typeorm/browser';
  
  import { TemperatureLog } from '../entities';
  import { ENTITIES } from '../../../constants';
    
  @EventSubscriber()
  class TemperatureLogSubscriber implements EntitySubscriberInterface {
    public listenTo() {
      return TemperatureLog;
    }
  
    @AfterInsert()
    public async afterInsert(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.TEMPERATURE_LOG,
        payload: JSON.stringify(entity),
      });
    }
  
    @AfterUpdate()
    public async afterUpdate(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.TEMPERATURE_LOG,
        payload: JSON.stringify(entity),
      });
    }
  }
  
  export { TemperatureLogSubscriber };
  