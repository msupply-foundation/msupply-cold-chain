/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column } from 'typeorm/browser';
import { Base } from './Base';

@Entity('SyncConfig')
class SyncConfig extends Base {
  @Column({ type: 'varchar', nullable: true })
  loginUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  sensorUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  temperatureLogUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  temperatureBreachUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  username!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string;

  @Column({ type: 'int', nullable: true })
  lastSync!: number;
}

export { SyncConfig };

export default SyncConfig;