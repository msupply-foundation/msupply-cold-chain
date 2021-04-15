import { EntityManager } from 'typeorm/browser';
import { ENTITIES } from '../../constants';

import { UtilService } from '../UtilService';


class SyncService {
    private manager: EntityManager;

    constructor(manager: EntityManager) {
        this.manager = manager;
    }

    public async log(id: string, type: string, payload: string) {
        this.manager.save(ENTITIES.SYNC_LOG, {
            id,
            type,
            payload,
            timestamp: new UtilService().now()
        });
    }
}

export { SyncService };