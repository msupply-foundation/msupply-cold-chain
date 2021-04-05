/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
    EventSubscriber,
    EntitySubscriberInterface,
    AfterInsert,
    AfterUpdate,
    InsertEvent,
  } from 'typeorm/browser';

  import { TemperatureBreach } from '../entities';
  
  import { ENTITIES } from '../../../constants';
  
  @EventSubscriber()
  class TemperatureBreachSubscriber implements EntitySubscriberInterface {
    public listenTo() {
      return TemperatureBreach;
    }
  
    @AfterInsert()
    public async afterInsert(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.TEMPERATURE_BREACH,
        payload: JSON.stringify(entity),
      });
    }
  
    @AfterUpdate()
    public async afterUpdate(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.TEMPERATURE_BREACH,
        payload: JSON.stringify(entity),
      });
    }
  }
  
  export { TemperatureBreachSubscriber };
  