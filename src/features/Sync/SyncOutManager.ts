import axios from 'axios';

import { DatabaseService } from '../../common/services/Database';

import { SyncLog } from "../../common/services/Database/entities";

const GET_SYNC_CONFIG = 'SELECT * FROM syncconfig';

const SET_SYNC_LOGIN_URL = 'UPDATE syncconfig SET loginurl = ?'
const SET_SYNC_SENSOR_URL = 'UPDATE syncconfig SET sensorurl = ?'
const SET_SYNC_TEMPERATURE_LOG_URL = 'UPDATE syncconfig SET temperaturelogurl = ?'
const SET_SYNC_TEMPERATURE_BREACH_URL = 'UPDATE syncconfig SET temperaturebreachurl = ?'
const SET_SYNC_USERNAME = `UPDATE syncconfig SET username = ?`;
const SET_SYNC_PASSWORD = `UPDATE syncconfig SET password = ?`;

interface SyncConfig {
    loginUrl: string,
    sensorUrl: string,
    temperatureLogUrl: string,
    temperatureBreachUrl: string
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
            loginUrl,
            sensorUrl, 
            temperatureLogUrl,
            temperatureBreachUrl,
            username,
            password
        }] = await this.databaseService.query(GET_SYNC_CONFIG);

        this.config = {
            loginUrl,
            sensorUrl,
            temperatureLogUrl,
            temperatureBreachUrl,
            username,
            password
        };
    }

    setLoginUrl = async (url: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_LOGIN_URL, [url]);
        this.config.loginUrl = url; 
    }

    setSensorUrl = async (url: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_SENSOR_URL, [url]);
        this.config.sensorUrl = url; 
    }

    setTemperatureLogUrl = async (url: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_TEMPERATURE_LOG_URL, [url]);
        this.config.temperatureLogUrl = url; 
    }

    setTemperatureBreachUrl = async (url: string): Promise<void> => { 
        await this.databaseService.query(SET_SYNC_TEMPERATURE_BREACH_URL, [url]);
        this.config.temperatureBreachUrl = url; 
    }

    setUsername = async (username: string): Promise<void> => {
        await this.databaseService.query(SET_SYNC_USERNAME, [username]);
        this.config.username = username; 
    }

    setPassword = async (password: string): Promise<void> => {
        await this.databaseService.query(SET_SYNC_PASSWORD, [password]);
        this.config.password = password; 
    }

    get loginUrl(): string { return this.config.loginUrl }

    get sensorUrl(): string { return this.config.sensorUrl }

    get temperatureLogUrl(): string { return this.config.temperatureLogUrl }

    get temperatureBreachUrl(): string { return this.config.temperatureBreachUrl }

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


