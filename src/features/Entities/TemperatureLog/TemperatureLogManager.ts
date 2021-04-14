import { DatabaseService } from "../../../common/services/Database";
import { UtilService } from "../../../common/services/UtilService";

import { ENTITIES } from "../../../common/constants";
import { TemperatureLog } from "../../../common/services/Database/entities";

export class TemperatureLogManager {
    databaseService: DatabaseService;

    utilService: UtilService;

    constructor(dbService: DatabaseService, utilService: UtilService) {
        this.databaseService = dbService;
        this.utilService = utilService;
    }

    upsert = async (temperatureLog: Partial<TemperatureLog>[]): Promise<Partial<TemperatureLog>[]> => {
        return this.databaseService.upsert(ENTITIES.TEMPERATURE_LOG, temperatureLog);
    };

    addNewTemperatureLog = async (temperatureLog: Partial<TemperatureLog>): Promise<Partial<TemperatureLog>[]> => {
        return this.addNewTemperatureLogs([temperatureLog]);
    };

    addNewTemperatureLogs = async (temperatureLogs: Partial<TemperatureLog>[]): Promise<Partial<TemperatureLog>[]> => {
        return this.upsert(temperatureLogs.map(temperatureLog => ({ id: this.utilService.uuid(), ...temperatureLog })));
    }
}