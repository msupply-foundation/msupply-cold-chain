/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column } from 'typeorm/browser';
import { Base } from './Base';

@Entity('SyncQueue')
export class SyncQueue extends Base {
  @Column({ type: 'varchar', nullable: true })
  type!: string;

  @Column({ type: 'varchar', nullable: true })
  payload!: string;
}

export default SyncQueue;
