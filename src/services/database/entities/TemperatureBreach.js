/* eslint-disable import/no-cycle */
import { JoinColumn, ManyToOne, Entity, Column, OneToMany } from 'typeorm/browser';
import { Base } from './Base';
import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreachConfiguration } from './TemperatureBreachConfiguration';

@Entity('TemperatureBreach')
class TemperatureBreach extends Base {
  @Column({ type: 'datetime', nullable: true })
  endTimestamp;

  @Column({ type: 'double', nullable: false })
  startTimestamp;

  @Column({ type: 'varchar', nullable: false })
  temperatureBreachConfigurationId;

  @ManyToOne(() => TemperatureBreachConfiguration, config => config.temperatureBreaches, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn({ name: 'temperatureBreachConfigId' })
  temperatureBreachConfiguration;

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.temperatureBreach, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs;
}

export { TemperatureBreach };
