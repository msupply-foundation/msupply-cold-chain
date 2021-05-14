/* istanbul ignore file */

import { OneToMany, Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';

import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('Sensor')
class Sensor {
  static getTableDefinition = (): string =>
    `CREATE TABLE IF NOT EXISTS Sensor (
    id             VARCHAR       PRIMARY KEY
                                 NOT NULL,
    macAddress     VARCHAR (17)  NOT NULL,
    batteryLevel   INTEGER,
    logInterval    INTEGER       NOT NULL,
    name           VARCHAR (101),
    logDelay       INTEGER,
    programmedDate INTEGER,
    isActive       BOOLEAN       DEFAULT (1)
);
`;

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

  @Column({ nullable: true, default: true, type: 'boolean' })
  isActive!: boolean;

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
