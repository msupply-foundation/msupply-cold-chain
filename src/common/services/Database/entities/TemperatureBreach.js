/* eslint-disable import/no-cycle */
import { JoinColumn, ManyToOne, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm/browser';
import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreachConfiguration } from './TemperatureBreachConfiguration';
import { Sensor } from './Sensor';

@Entity('TemperatureBreach')
class TemperatureBreach {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id;

  @Column({ type: 'integer', nullable: true })
  endTimestamp;

  @Column({ type: 'integer', nullable: false })
  startTimestamp;

  @Column({ type: 'varchar', nullable: false })
  temperatureBreachConfigurationId;

  @Column({ type: 'boolean', nullable: false, default: false })
  handled;

  @ManyToOne(() => TemperatureBreachConfiguration, config => config.temperatureBreaches, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn({ name: 'temperatureBreachConfigurationId' })
  temperatureBreachConfiguration;

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.temperatureBreach, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs;

  @Column({ type: 'varchar', nullable: false })
  sensorId;

  @ManyToOne(() => Sensor, sensor => sensor.temperatureBreaches, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'sensorId' })
  sensor;
}

export { TemperatureBreach };
