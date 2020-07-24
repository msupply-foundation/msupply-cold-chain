/* eslint-disable import/no-cycle */
import { OneToMany, Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';
import { SensorLog } from './SensorLog';
import { TemperatureLog } from './TemperatureLog';

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

  @OneToMany(() => SensorLog, sensorLog => sensorLog.temperatureBreach, {
    cascade: ['insert', 'update'],
  })
  sensorLogs;

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.sensor, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs;
}

export { Sensor };
