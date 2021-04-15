/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { ManyToOne, Entity, Column, PrimaryColumn, Index, JoinColumn } from 'typeorm/browser';

import { Sensor } from './Sensor';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('TemperatureLog')
class TemperatureLog {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id!: string;

  @Column({ type: 'double' })
  temperature!: number;

  @Index()
  @Column({ type: 'integer' })
  timestamp!: number;

  @Index()
  @Column({ type: 'integer' })
  logInterval!: number;

  @Column({ type: 'varchar', nullable: true })
  temperatureBreachId!: string | null;

  @ManyToOne(() => TemperatureBreach, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  @JoinColumn({ name: 'temperatureBreachId' })
  temperatureBreach!: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  sensorId!: string | null;

  @JoinColumn({ name: 'sensorId' })
  @ManyToOne(() => Sensor, temperatureBreach => temperatureBreach.temperatureLogs, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  sensor!: Sensor;
}

export { TemperatureLog };
