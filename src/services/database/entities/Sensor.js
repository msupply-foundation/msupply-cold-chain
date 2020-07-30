/* eslint-disable import/no-cycle */
import { OneToMany, Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';
import { SensorLog } from './SensorLog';
import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('Sensor')
class Sensor {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', length: 17, unique: true })
  macAddress;

  @Column({ type: 'integer' })
  logInterval;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  name;

  @OneToMany(() => SensorLog, sensorLog => sensorLog.sensor, {
    cascade: ['insert', 'update'],
  })
  sensorLogs;

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.sensor, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs;

  @OneToMany(() => TemperatureBreach, temperatureBreach => temperatureBreach.sensor, {
    cascade: ['insert', 'update'],
  })
  temperatureBreaches;
}

export { Sensor };
