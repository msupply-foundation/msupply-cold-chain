/* eslint-disable import/no-cycle */
import { Entity, Column, OneToMany } from 'typeorm/browser';
import { Base } from './Base';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('TemperatureBreachConfiguration')
class TemperatureBreachConfiguration extends Base {
  @Column({ type: 'double', nullable: false })
  minimumTemperature;

  @Column({ type: 'double', nullable: false })
  maximumTemperature;

  @Column({ type: 'integer', nullable: false })
  duration;

  @Column({ type: 'varchar', length: 7, nullable: true })
  colour;

  @Column({ type: 'varchar', nullable: true })
  description;

  @OneToMany(
    () => TemperatureBreach,
    temperatureBreach => temperatureBreach.TemperatureBreachConfiguration,
    {
      cascade: ['insert', 'update'],
    }
  )
  temperatureBreaches;
}

export { TemperatureBreachConfiguration };
