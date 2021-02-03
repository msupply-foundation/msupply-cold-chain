/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';

@Entity('Setting')
class Setting {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  key;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  value;
}

export { Setting };
