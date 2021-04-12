import { ENTITIES } from "../../common/constants";
import { SyncLog } from "../../common/services/Database/entities";

const HOSTNAME = '10.0.2.2';
const PORT = '8080';

const RESOURCES = {
    COLDCHAIN_V1: 'coldchain/v1'
}

const PATHS = {
    LOGIN: 'login',
    SENSOR: 'sensor', 
    TEMPERATURE_LOG: 'temperature-log',
    TEMPERATURE_BREACH: 'temperature-breach'
}
class SyncOutManager {
    private paths: { [key: string]: string };

    constructor() {
        // TODO: initialise SyncOut manager from dependency container.
        const rootPath = `http://${HOSTNAME}:${PORT}/${RESOURCES.COLDCHAIN_V1}`;

        const loginPath = `${rootPath}/${PATHS.LOGIN}`;
        const sensorPath = `${rootPath}/${PATHS.SENSOR}`;
        const temperatureLogPath = `${rootPath}/${PATHS.TEMPERATURE_LOG}`;
        const temperatureBreachPath = `${rootPath}/${PATHS.TEMPERATURE_BREACH}`;

        this.paths = {
            login: loginPath,
            sensor: sensorPath,
            temperatureLog: temperatureLogPath,
            temperatureBreach: temperatureBreachPath,
        };
    }

    

    pushLogs = async(logs: SyncLog[]) => {
        const loginResponse = await fetch(this.paths.login, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                username: 'GEN',
                password: 'secret'
            })
        })

        const cookie = loginResponse.headers.get('set-cookie');

        const { sensorSyncLogs, temperatureLogSyncLogs, temperatureBreachSyncLogs } = logs.reduce<Record<string, SyncLog[]>>((acc, log) => {
            const { type } = log;
            switch(type) {
                case ENTITIES.SENSOR:
                    return { ...acc, sensorSyncLogs: [ ...acc.sensorSyncLogs, log] };
                case ENTITIES.TEMPERATURE_LOG:
                    return { ...acc, temperatureLogSyncLogs: [ ...acc.temperatureLogSyncLogs, log] };
                case ENTITIES.TEMPERATURE_BREACH:
                    return { ...acc, temperatureBreachSyncLogs: [ ...acc.temperatureBreachSyncLogs, log]}
                default:
                    return acc;
            }
        }, { sensorSyncLogs: [], temperatureLogSyncLogs: [], temperatureBreachSyncLogs: [] }); 
        
        if (cookie) {
            const pushConfig = {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                    'cookie': cookie
                },
            }
    
            await fetch(this.paths.sensor, {
                ...pushConfig,
                body: JSON.stringify(sensorSyncLogs.map(log => JSON.parse(log.payload)))
            })

            await fetch(this.paths.temperatureLog, {
                ...pushConfig,
                body: JSON.stringify(temperatureLogSyncLogs.map(log => JSON.parse(log.payload)))
            })

            await fetch(this.paths.temperatureBreach, {
                ...pushConfig,
                body: JSON.stringify(temperatureBreachSyncLogs.map(log => JSON.parse(log.payload)))
            })
        }
    }
}

export { SyncOutManager }