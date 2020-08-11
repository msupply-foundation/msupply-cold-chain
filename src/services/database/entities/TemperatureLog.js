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

  @Column({ type: 'integer' })
  timestamp;

  @Column({ type: 'varchar', nullable: true })
  temperatureBreachId;

  @ManyToOne(() => TemperatureBreach, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  @JoinColumn({ name: 'temperatureBreachId' })
  temperatureBreach;

  @Column({ type: 'varchar', nullable: true })
  sensorId;

  @Index()
  @JoinColumn({ name: 'sensorId' })
  @ManyToOne(() => Sensor, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  sensor;
}

export { TemperatureLog };
