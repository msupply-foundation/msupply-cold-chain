import axios from 'axios';

import { DatabaseService } from '../../common/services/Database';

import { SyncLog } from "../../common/services/Database/entities";

const GET_SYNC_CONFIG = 'SELECT * FROM syncconfig';

const SET_SYNC_HOST = 'UPDATE syncconfig SET host = ?'
const SET_SYNC_PORT = 'UPDATE syncconfig SET PORT = ?'
const SET_SYNC_LOGIN_PATH = 'UPDATE syncconfig SET loginPath = ?'
const SET_SYNC_SENSOR_PATH = 'UPDATE syncconfig SET sensorpath = ?'
const SET_SYNC_TEMPERATURE_LOG_PATH = 'UPDATE syncconfig SET temperaturelogpath = ?'
const SET_SYNC_TEMPERATURE_BREACH_PATH = 'UPDATE syncconfig SET temperaturebreachpath = ?'
const SET_SYNC_USERNAME = `UPDATE syncconfig SET username = ?`;
const SET_SYNC_PASSWORD = `UPDATE syncconfig SET password = ?`;

interface SyncConfig {
    host: string,
    port: string,
    paths: {
        login: string,
        sensor: string,
        temperatureLog: string,
        temperatureBreach: string
    },
    username: string,
    password: string,
}

class SyncOutManager {
    private databaseService: DatabaseService;

    private config!: SyncConfig;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
    }

    hydrate = async (): Promise<void> => {
        const [{ 
            host, 
            port, 
            loginPath,
            sensorPath, 
            temperatureLogPath,
            temperatureBreachPath,
            username,
            password
        }] = await this.databaseService.query(GET_SYNC_CONFIG);

        this.config = {
            host,
            port,
            paths: {
                login: loginPath,
                sensor: sensorPath,
                temperatureLog: temperatureLogPath,
                temperatureBreach: temperatureBreachPath,
            },
            username,
            password
        };
    }

    setHost = async (host: string): Promise<void> => {
        await this.databaseService.query(SET_SYNC_HOST, [host]);
        this.config.host = host;
    }

    setPort = async (port: string): Promise<void> => {
        await this.databaseService.query(SET_SYNC_PORT, [port]);
        this.config.port = port;
    }

    setLoginPath = async (path: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_LOGIN_PATH, [path]);
        this.config.paths.login = path; 
    }

    setSensorPath = async (path: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_SENSOR_PATH, [path]);
        this.config.paths.sensor = path; 
    }

    setTemperatureLogPath = async (path: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_TEMPERATURE_LOG_PATH, [path]);
        this.config.paths.temperatureLog = path; 
    }

    setTemperatureBreachPath = async (path: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_TEMPERATURE_BREACH_PATH, [path]);
        this.config.paths.temperatureBreach = path; 
    }

    setUsername = async (username: string): Promise<void> => {
        await this.databaseService.query(SET_SYNC_USERNAME, [username]);
        this.config.username = username; 
    }

    setPassword = async (password: string): Promise<void> => {
        await this.databaseService.query(SET_SYNC_PASSWORD, [password]);
        this.config.password = password; 
    }

    get host(): string { return this.config.host }

    get port(): string { return this.config.port }

    get loginPath(): string { return this.config.paths.login }
    
    get sensorPath(): string { return this.config.paths.sensor }

    get temperatureLogPath(): string { return this.config.paths.temperatureLog }

    get temperatureBreachPath(): string { return this.config.paths.temperatureBreach }

    get loginUrl(): string { return `${this.host}:${this.port}/${this.loginPath}` }

    get sensorUrl(): string { return `${this.host}:${this.port}/${this.sensorPath}` }

    get temperatureLogUrl(): string { return `${this.host}:${this.port}/${this.temperatureLogPath}` }

    get temperatureBreachUrl(): string { return `${this.host}:${this.port}/${this.temperatureBreachPath}` }

    get username(): string { return this.config.username }

    get password(): string { return this.config.password }

    getAuthenticationBody = (): string => JSON.stringify({ username: this.config.username, password: this.config.password });

    getSyncBody = (logs: SyncLog[]): string => JSON.stringify(logs.map(log => JSON.parse(log.payload))); 

    login = async (): Promise<void> => {
        axios.post(this.loginUrl, this.getAuthenticationBody(), { withCredentials: true });
    }

    syncSensors = async (logs: SyncLog[]): Promise<void> => {
        axios.put(this.sensorUrl, this.getSyncBody(logs), { withCredentials: true });
    }

    syncTemperatureLogs = async (logs: SyncLog[]): Promise<void> => {
        axios.put(this.temperatureLogUrl, this.getSyncBody(logs), { withCredentials: true });
    }

    syncTemperatureBreaches = async (logs: SyncLog[]): Promise<void> => {
        axios.put(this.temperatureBreachUrl, this.getSyncBody(logs), { withCredentials: true });
    }
}

export { SyncOutManager }


