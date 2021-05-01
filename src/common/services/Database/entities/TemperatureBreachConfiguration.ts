/* istanbul ignore file */

import { OneToMany, Entity, Column } from 'typeorm/browser';

import { Base } from './Base';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('TemperatureBreachConfiguration')
class TemperatureBreachConfiguration extends Base {
  @Column({ type: 'double', nullable: false })
  minimumTemperature!: number;

  @Column({ type: 'double', nullable: false })
  maximumTemperature!: number;

  @Column({ type: 'integer', nullable: false })
  duration!: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  colour!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string;

  @OneToMany(
    () => TemperatureBreach,
    (temperatureBreach: TemperatureBreach) => temperatureBreach.temperatureBreachConfiguration,
    {
      cascade: ['insert', 'update'],
    }
  )
  temperatureBreaches!: TemperatureBreach[];
}

export { TemperatureBreachConfiguration };
