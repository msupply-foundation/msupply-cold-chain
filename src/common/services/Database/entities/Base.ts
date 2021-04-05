/* istanbul ignore file */

import { EntitySubscriberInterface, PrimaryGeneratedColumn } from 'typeorm/browser';

abstract class Base {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}

export { Base };
