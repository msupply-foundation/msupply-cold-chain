import moment from 'moment';
import { InsertEvent, UpdateEvent, EntityManager, EntityMetadata } from 'typeorm/browser';

import { Base } from './entities';
import { ENTITIES } from '../../constants';

class SyncService {
  private entity: Base;
  private manager: EntityManager;
  private metadata: EntityMetadata;

  constructor(event: InsertEvent<any> | UpdateEvent<any>) {
    this.entity = event.entity;
    this.manager = event.manager;
    this.metadata = event.metadata;
  }

  public async log() {
    this.manager.save(ENTITIES.SYNC_LOG, {
      id: this.entity.id,
      type: this.metadata.tableName,
      payload: JSON.stringify(this.entity),
      timestamp: moment().unix(),
    });
  }
}

export { SyncService };
