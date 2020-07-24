/* eslint-disable import/no-cycle */
import { ManyToOne, JoinColumn, Entity, Column } from 'typeorm/browser';
import { Base } from './Base';
import { Sensor } from './Sensor';

@Entity('SensorLog')
class SensorLog extends Base {
  @Column({ type: 'double' })
  temperature;

  @Column({ type: 'datetime' })
  timestamp;

  @Column({ type: 'varchar', nullable: true })
  sensorId;

  @JoinColumn({ name: 'sensorId' })
  @ManyToOne(() => Sensor, sensor => sensor.sensorLogs, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  temperatureBreach;
}

export { SensorLog };
