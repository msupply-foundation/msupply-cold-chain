/* istanbul ignore file */

import { OneToMany, Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';
import { TemperatureBreach } from './TemperatureBreach';

@Entity('TemperatureBreachConfiguration')
class TemperatureBreachConfiguration {
  static getTableDefinition = (): string => `
  CREATE TABLE IF NOT EXISTS TemperatureBreachConfiguration (
    id                 VARCHAR     PRIMARY KEY
                                   NOT NULL,
    minimumTemperature DOUBLE      NOT NULL,
    maximumTemperature DOUBLE      NOT NULL,
    duration           INTEGER     NOT NULL,
    colour             VARCHAR (7),
    description        VARCHAR
);
`;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double', nullable: false })
  minimumTemperature: number;

  @Column({ type: 'double', nullable: false })
  maximumTemperature: number;

  @Column({ type: 'integer', nullable: false })
  duration: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  colour: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @OneToMany(
    () => TemperatureBreach,
    (temperatureBreach: TemperatureBreach) => temperatureBreach.temperatureBreachConfiguration,
    {
      cascade: ['insert', 'update'],
    }
  )
  temperatureBreaches: TemperatureBreach[];
}

export { TemperatureBreachConfiguration };
