/* istanbul ignore file */

import { PrimaryGeneratedColumn } from 'typeorm/browser';

abstract class Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

export { Base };
