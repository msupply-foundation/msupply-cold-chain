import { ENTITIES } from "../../common/constants";
import { SyncLog } from "../../common/services/Database/entities";

const URL = '10.0.2.2:8080/coldchain/v1'
const USERNAME = 'GEN';
const PASSWORD = 'secret';

const PATHS = {
    ROOT: 'coldchain/v1',
    LOGIN: 'login',
    SENSOR: 'sensor', 
    TEMPERATURE_LOG: 'temperature-log',
    TEMPERATURE_BREACH: 'temperature-breach'
}
class SyncOutManager {
    private url: string;

    private username: string;

    private password: string;

    constructor() {
        this.url = URL;
        this.username = USERNAME;
        this.password = PASSWORD;
    }

    setUrl = (url: string): void  => {
        this.url = url;
    }

    setUsername = (username: string): void => {
        this.username = username;
    }

    setPassword = (password: string): void => {
        this.password = password;
    }

    pushLogs = async(logs: SyncLog[]): Promise<void> => {
        const loginResponse = await fetch(`${this.url}/${PATHS.LOGIN}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password
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
    
            await fetch(`${this.url}/${PATHS.SENSOR}`, {
                ...pushConfig,
                body: JSON.stringify(sensorSyncLogs.map(log => JSON.parse(log.payload)))
            })

            await fetch(`${this.url}/${PATHS.TEMPERATURE_LOG}`, {
                ...pushConfig,
                body: JSON.stringify(temperatureLogSyncLogs.map(log => JSON.parse(log.payload)))
            })

            await fetch(`${this.url}/${PATHS.TEMPERATURE_BREACH}`, {
                ...pushConfig,
                body: JSON.stringify(temperatureBreachSyncLogs.map(log => JSON.parse(log.payload)))
            })
        }
    }
}

export { SyncOutManager }