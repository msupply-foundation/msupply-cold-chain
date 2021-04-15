/* istanbul ignore file */

/* eslint-disable import/no-cycle */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm/browser';

@Entity('Setting')
class Setting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  key!: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  value!: string;
}

export { Setting };
