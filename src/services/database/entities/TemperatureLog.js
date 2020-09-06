/* eslint-disable import/no-cycle */
import { PrimaryColumn, ManyToOne, Entity, Column, JoinColumn, Index } from 'typeorm/browser';
import { TemperatureBreach } from './TemperatureBreach';
import { Sensor } from './Sensor';

@Entity('TemperatureLog')
class TemperatureLog {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id;

  @Column({ type: 'double' })
  temperature;

  @Index()
  @Column({ type: 'integer' })
  timestamp;

  @Index()
  @Column({ type: 'integer' })
  logInterval;

  @Column({ type: 'varchar', nullable: true })
  temperatureBreachId;

  @ManyToOne(() => TemperatureBreach, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  @JoinColumn({ name: 'temperatureBreachId' })
  temperatureBreach;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  sensorId;

  @JoinColumn({ name: 'sensorId' })
  @ManyToOne(() => Sensor, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  sensor;
}

export { TemperatureLog };
