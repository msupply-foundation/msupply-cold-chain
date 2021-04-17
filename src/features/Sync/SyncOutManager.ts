import axios from 'axios';

import { DatabaseService } from '../../common/services/Database';

import { SyncLog } from "../../common/services/Database/entities";

const GET_LOGIN_URL = 'SELECT loginurl from syncconfig'
const GET_SENSOR_URL = 'SELECT sensorurl from syncconfig'
const GET_TEMPERATURE_LOG_URL = 'SELECT temperaturelogurl from syncconfig'
const GET_TEMPERATURE_BREACH_URL = 'SELECT temperaturebreachurl from syncconfig'
const GET_USERNAME = 'SELECT username from syncconfig'
const GET_PASSWORD = 'SELECT password from syncconfig'

const SET_LOGIN_URL = 'UPDATE syncconfig SET loginurl = ?'
const SET_SENSOR_URL = 'UPDATE syncconfig SET sensorurl = ?'
const SET_TEMPERATURE_LOG_URL = 'UPDATE syncconfig SET temperaturelogurl = ?'
const SET_TEMPERATURE_BREACH_URL = 'UPDATE syncconfig SET temperaturebreachurl = ?'
const SET_USERNAME = `UPDATE syncconfig SET username = ?`;
const SET_PASSWORD = `UPDATE syncconfig SET password = ?`;

class SyncOutManager {
    private databaseService: DatabaseService;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
    }

    private getAuthenticationBody = (username: string, password: string): string => JSON.stringify({ username, password });

    private getSyncBody = (logs: SyncLog[]): string => JSON.stringify(logs.map(log => JSON.parse(log.payload))); 

    public getLoginUrl = async(): Promise<string> => {
        const [{ loginUrl }] = await this.databaseService.query(GET_LOGIN_URL);
        return loginUrl;
    }

    public getSensorUrl = async(): Promise<string> => {
        const [{ sensorUrl }] = await this.databaseService.query(GET_SENSOR_URL);
        return sensorUrl;
    }

    public getTemperatureLogUrl = async(): Promise<string> => {
        const [{ temperatureLogUrl }] = await this.databaseService.query(GET_TEMPERATURE_LOG_URL);
        return temperatureLogUrl;
    }

    public getTemperatureBreachUrl = async(): Promise<string> => {
        const [{ temperatureBreachUrl }] = await this.databaseService.query(GET_TEMPERATURE_BREACH_URL);
        return temperatureBreachUrl;
    }

    public getUsername = async(): Promise<string> => {
        const [{ username }] = await this.databaseService.query(GET_USERNAME);
        return username;
    }

    public getPassword = async(): Promise<string> => {
        const [{ password }] = await this.databaseService.query(GET_PASSWORD);
        return password;
    }

    public setLoginUrl = async (url: string): Promise<void> => this.databaseService.query(SET_LOGIN_URL, [url]);

    public setSensorUrl = async (url: string): Promise<void> => this.databaseService.query(SET_SENSOR_URL, [url]);

    public setTemperatureLogUrl = async (url: string): Promise<void> => this.databaseService.query(SET_TEMPERATURE_LOG_URL, [url]);

    public setTemperatureBreachUrl = async (url: string): Promise<void> => this.databaseService.query(SET_TEMPERATURE_BREACH_URL, [url]);

    public setUsername = async (username: string): Promise<void> => this.databaseService.query(SET_USERNAME, [username]); 

    public setPassword = async (password: string): Promise<void> => this.databaseService.query(SET_PASSWORD, [password]);

    public login = async (loginUrl: string, username: string, password: string): Promise<void> => {
        axios.post(loginUrl, this.getAuthenticationBody(username, password), { withCredentials: true });
    }

    public syncSensors = async (sensorUrl: string, logs: SyncLog[]): Promise<void> => {
        axios.put(sensorUrl, this.getSyncBody(logs), { withCredentials: true });
    }

    public syncTemperatureLogs = async (temperatureLogUrl: string, logs: SyncLog[]): Promise<void> => {
        axios.put(temperatureLogUrl, this.getSyncBody(logs), { withCredentials: true });
    }

    public syncTemperatureBreaches = async (temperatureBreachUrl: string, logs: SyncLog[]): Promise<void> => {
        axios.put(temperatureBreachUrl, this.getSyncBody(logs), { withCredentials: true });
    }
}

export { SyncOutManager }


