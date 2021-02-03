/* istanbul ignore file */

import { PrimaryGeneratedColumn } from 'typeorm/browser';

class Base {
  @PrimaryGeneratedColumn('uuid')
  id;
}

export { Base };
