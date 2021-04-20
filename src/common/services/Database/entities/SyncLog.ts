/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column, PrimaryColumn } from 'typeorm/browser';
@Entity('SyncLog')
export class SyncLog {
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
