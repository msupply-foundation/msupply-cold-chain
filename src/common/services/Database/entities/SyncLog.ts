/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column } from 'typeorm/browser';
import { Base } from './Base';

@Entity('SyncLog')
export class SyncLog extends Base {
  @Column({ type: 'varchar', nullable: true })
  type!: string;

  @Column({ type: 'varchar', nullable: true })
  payload!: string;

  @Column({ type: 'integer', nullable: true })
  timestamp!: number;
}

export default SyncLog;
