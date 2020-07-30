/* eslint-disable import/no-cycle */
import { ManyToOne, Entity, Column, JoinColumn, Index } from 'typeorm/browser';
import { Base } from './Base';
import { TemperatureBreach } from './TemperatureBreach';
import { Sensor } from './Sensor';

@Entity('TemperatureLog')
class TemperatureLog extends Base {
  @Column({ type: 'double' })
  temperature;

  @Column({ type: 'integer' })
  timestamp;

  @Column({ type: 'varchar', nullable: true })
  temperatureBreachId;

  @ManyToOne(() => TemperatureBreach, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: true,
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
