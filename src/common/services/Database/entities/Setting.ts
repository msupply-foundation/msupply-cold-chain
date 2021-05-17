/* istanbul ignore file */

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';

@Entity('Setting')
class Setting {
  static getTableDefinition = () => `
  CREATE TABLE IF NOT EXISTS  Setting (
    id    VARCHAR       PRIMARY KEY
                        NOT NULL,
    [key] VARCHAR (100),
    value VARCHAR (100) 
);
`;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  key!: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  value!: string;
}

export { Setting };
