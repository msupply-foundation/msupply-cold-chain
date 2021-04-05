/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { ManyToOne, JoinColumn, Entity, Column, Index } from 'typeorm/browser';

import { Base } from './Base';
import { Sensor } from './Sensor';

@Entity('SensorLog')
class SensorLog extends Base {
  @Column({ type: 'double' })
  temperature!: number;

  @Column({ type: 'integer', nullable: true })
  timestamp!: number;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  sensorId!: string;

  @JoinColumn({ name: 'sensorId' })
  @ManyToOne(() => Sensor, sensor => sensor.sensorLogs, {
    cascade: ['insert', 'update'],
  })
  sensor!: Sensor;
}
export { SensorLog };
