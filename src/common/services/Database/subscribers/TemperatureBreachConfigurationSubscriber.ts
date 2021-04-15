/* istanbul ignore file */

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
  public static listenTo(): typeof TemperatureBreachConfiguration {
    return TemperatureBreachConfiguration;
  }

  @AfterInsert()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async afterInsert(_: InsertEvent<TemperatureBreachConfiguration>): Promise<void> {}

  @AfterUpdate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async afterUpdate(_: UpdateEvent<TemperatureBreachConfiguration>): Promise<void> {}
}

export { TemperatureBreachConfigurationSubscriber };
