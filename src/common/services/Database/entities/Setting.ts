/* istanbul ignore file */

import { Entity, Column } from 'typeorm/browser';

@Entity('Setting')
class Setting {
  static getTableDefinition = () => `
  CREATE TABLE IF NOT EXISTS  Setting (
    [key] VARCHAR (100) PRIMARY KEY
                        NOT NULL,
    value VARCHAR (100) 
);
`;

  @Column({ primary: true, nullable: true, type: 'varchar', length: 100 })
  key: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  value: string;
}

export { Setting };
