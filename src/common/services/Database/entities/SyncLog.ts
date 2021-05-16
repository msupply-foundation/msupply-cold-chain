/* istanbul ignore file */

import { Entity, Column, PrimaryColumn } from 'typeorm/browser';
@Entity('SyncLog')
export class SyncLog {
  static getTableDefinition = (): string => `
  CREATE TABLE IF NOT EXISTS  SyncLog (
    id                  VARCHAR PRIMARY KEY
                                NOT NULL,
    payload             VARCHAR  NOT NULL,
    timestamp           INTEGER NOT NULL,
    type                VARCHAR NOT NULL
);
`;

  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  type!: string;

  @Column({ type: 'varchar', nullable: true })
  payload!: string;

  @Column({ type: 'integer', nullable: true })
  timestamp!: number;
}

export default SyncLog;
