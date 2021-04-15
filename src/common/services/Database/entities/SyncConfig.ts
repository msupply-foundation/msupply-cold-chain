/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column } from 'typeorm/browser';
import { Base } from './Base';

@Entity('SyncConfig')
class SyncConfig extends Base {
  @Column({ type: 'varchar', nullable: true })
  host!: string;

  @Column({ type: 'varchar', nullable: true })
  port!: string;

  @Column({ type: 'varchar', nullable: true })
  username!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  loginPath!: string;

  @Column({ type: 'varchar', nullable: true })
  sensorPath!: string;

  @Column({ type: 'varchar', nullable: true })
  temperatureLogPath!: string;

  @Column({ type: 'varchar', nullable: true })
  temperatureBreachPath!: string;
}

export { SyncConfig };

export default SyncConfig;