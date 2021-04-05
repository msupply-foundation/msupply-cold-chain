/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { OneToMany, Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';

import { SensorLog } from './SensorLog';
import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('Sensor')
class Sensor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 17, unique: true })
  macAddress!: string;

  @Column({ type: 'integer', nullable: true })
  batteryLevel!: number;

  @Column({ type: 'integer' })
  logInterval!: number;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  name!: string;

  @Column({ nullable: true, type: 'int' })
  logDelay!: number;

  @Column({ nullable: true, type: 'int' })
  programmedDate!: number;

  @OneToMany(() => SensorLog, sensorLog => sensorLog.sensor, {
    cascade: ['insert', 'update'],
  })
  sensorLogs!: SensorLog[];

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.sensor, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs!: TemperatureLog[];

  @OneToMany(() => TemperatureBreach, temperatureBreach => temperatureBreach.sensor, {
    cascade: ['insert', 'update'],
  })
  temperatureBreaches!: TemperatureBreach[];
}

export { Sensor };
