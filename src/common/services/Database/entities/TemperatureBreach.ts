/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { JoinColumn, ManyToOne, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm/browser';

import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreachConfiguration } from './TemperatureBreachConfiguration';
import { Sensor } from './Sensor';

@Entity('TemperatureBreach')
class TemperatureBreach {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id!: string;

  @Column({ type: 'integer', nullable: true })
  endTimestamp!: number;

  @Column({ type: 'integer', nullable: false })
  startTimestamp!: number;

  @Column({ type: 'varchar', nullable: false })
  temperatureBreachConfigurationId!: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  acknowledged!: boolean;

  @ManyToOne(() => TemperatureBreachConfiguration, config => config.temperatureBreaches, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn({ name: 'temperatureBreachConfigurationId' })
  temperatureBreachConfiguration!: TemperatureBreachConfiguration;

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.temperatureBreach, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs!: TemperatureLog[];

  @Column({ type: 'varchar', nullable: false })
  sensorId!: string | null;

  @ManyToOne(() => Sensor, sensor => sensor.temperatureBreaches, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'sensorId' })
  sensor!: Sensor;
}

export { TemperatureBreach };
