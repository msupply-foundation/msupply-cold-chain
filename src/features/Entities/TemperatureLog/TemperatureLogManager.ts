import { DatabaseService } from "../../../common/services/Database";
import { UtilService } from "../../../common/services/UtilService";

import { ENTITIES } from "../../../common/constants";

export class TemperatureLogManager {
    databaseService: DatabaseService;
    utilService: UtilService;

    constructor(dbService: DatabaseService, utilService: UtilService) {
        this.databaseService = dbService;
        this.utilService = utilService;
    }

    upsert = async (temperatureLog: object) => {
        return this.databaseService.upsert(ENTITIES.TEMPERATURE_LOG, temperatureLog);
    };

    addNewTemperatureLog = async (sensorId: string | null, logInterval: number, temperature: number, timestamp: number) => {
        const id = this.utilService.uuid();
        return this.upsert({ id, sensorId, logInterval, temperature, timestamp });
    };
}