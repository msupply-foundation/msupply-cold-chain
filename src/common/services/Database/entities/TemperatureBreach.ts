/* istanbul ignore file */

import { JoinColumn, ManyToOne, Entity, Column, OneToMany, PrimaryColumn } from 'typeorm/browser';

import { TemperatureLog } from './TemperatureLog';
import { TemperatureBreachConfiguration } from './TemperatureBreachConfiguration';
import { Sensor } from './Sensor';

@Entity('TemperatureBreach')
class TemperatureBreach {
  static getTableDefinition = (): string => `
  CREATE TABLE IF NOT EXISTS  TemperatureBreach (
    id                               VARCHAR PRIMARY KEY
                                             NOT NULL,
    endTimestamp                     INTEGER,
    startTimestamp                   INTEGER NOT NULL,
    temperatureBreachConfigurationId VARCHAR NOT NULL,
    acknowledged                     BOOLEAN NOT NULL
                                             DEFAULT (0),
    sensorId                         VARCHAR NOT NULL,
    CONSTRAINT FK_temperatureBreach_temperatureBreachConfig FOREIGN KEY (
        temperatureBreachConfigurationId
    )
    REFERENCES TemperatureBreachConfiguration (id) ON DELETE NO ACTION
                                                   ON UPDATE NO ACTION,
    CONSTRAINT FK_temperatureBreach_sensor FOREIGN KEY (
        sensorId
    )
    REFERENCES Sensor (id) ON DELETE NO ACTION
                           ON UPDATE NO ACTION
);
`;

  @PrimaryColumn({ type: 'varchar', nullable: false })
  id: string;

  @Column({ type: 'integer', nullable: true })
  endTimestamp: number;

  @Column({ type: 'integer', nullable: false })
  startTimestamp: number;

  @Column({ type: 'varchar', nullable: false })
  temperatureBreachConfigurationId: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  acknowledged: boolean;

  @ManyToOne(() => TemperatureBreachConfiguration, config => config.temperatureBreaches, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn({ name: 'temperatureBreachConfigurationId' })
  temperatureBreachConfiguration: TemperatureBreachConfiguration;

  @OneToMany(() => TemperatureLog, temperatureLog => temperatureLog.temperatureBreach, {
    cascade: ['insert', 'update'],
  })
  temperatureLogs: TemperatureLog[];

  @Column({ type: 'varchar', nullable: false })
  sensorId: string;

  @ManyToOne(() => Sensor, sensor => sensor.temperatureBreaches, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'sensorId' })
  sensor: Sensor;
}

export { TemperatureBreach };
