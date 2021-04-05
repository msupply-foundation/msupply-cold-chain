/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
    EntitySubscriberInterface,
    EventSubscriber,
    AfterInsert,
    InsertEvent,
    AfterUpdate,
  } from 'typeorm/browser';
  
  import { TemperatureBreachConfiguration } from '../entities';
  
  import { ENTITIES } from '../../../constants';

  @EventSubscriber()
  class TemperatureBreachConfigurationSubscriber implements EntitySubscriberInterface {
    public listenTo() {
      return TemperatureBreachConfiguration;
    }
  
    @AfterInsert()
    public async afterInsert(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.TEMPERATURE_BREACH_CONFIGURATION,
        payload: JSON.stringify(entity),
      });
    }
  
    @AfterUpdate()
    public async afterUpdate(event: InsertEvent<any>) {
      const { entity, manager } = event;
      manager.save(ENTITIES.SYNC_QUEUE, {
        type: ENTITIES.TEMPERATURE_BREACH_CONFIGURATION,
        payload: JSON.stringify(entity),
      });
    }
  }
  
  export { TemperatureBreachConfigurationSubscriber };
  