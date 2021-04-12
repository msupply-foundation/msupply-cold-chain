/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import {
  EntitySubscriberInterface,
  EventSubscriber,
  AfterInsert,
  InsertEvent,
  UpdateEvent,
  AfterUpdate,
} from 'typeorm/browser';

import { TemperatureBreachConfiguration } from '../entities';

@EventSubscriber()
class TemperatureBreachConfigurationSubscriber implements EntitySubscriberInterface {
  public listenTo() {
    return TemperatureBreachConfiguration;
  }

  @AfterInsert()
  public async afterInsert(_: InsertEvent<any>) {}

  @AfterUpdate()
  public async afterUpdate(_: UpdateEvent<any>) {}
}

export { TemperatureBreachConfigurationSubscriber };
