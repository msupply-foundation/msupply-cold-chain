/* istanbul ignore file */
import { ManyToOne, Entity, Column, PrimaryColumn, Index, JoinColumn } from 'typeorm/browser';

import { Sensor } from './Sensor';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('TemperatureLog')
class TemperatureLog {
  static getTableDefinition = (): string => `
  CREATE TABLE IF NOT EXISTS  TemperatureLog (
    id                  VARCHAR PRIMARY KEY
                                NOT NULL,
    temperature         DOUBLE  NOT NULL,
    timestamp           INTEGER NOT NULL,
    logInterval         INTEGER NOT NULL,
    temperatureBreachId VARCHAR,
    sensorId            VARCHAR,
    CONSTRAINT FK_a402bdeb5afaa9db6a3cf994200 FOREIGN KEY (
        temperatureBreachId
    )
    REFERENCES TemperatureBreach (id) ON DELETE NO ACTION
                                      ON UPDATE NO ACTION,
    CONSTRAINT FK_622389bedd377985ef49786f09f FOREIGN KEY (
        sensorId
    )
    REFERENCES Sensor (id) ON DELETE NO ACTION
                           ON UPDATE NO ACTION
);
`;

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
