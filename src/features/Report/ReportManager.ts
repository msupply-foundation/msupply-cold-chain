import { FormatService } from './../../common/services/FormatService/FormatService';
import { UtilService } from '~services/UtilService';
import { REPORT, LOGS_REPORT, BREACH_REPORT, BREACH_CONFIG_REPORT, STATS } from './queries';
import {
  SensorStatsReportShape,
  SensorReportShape,
  TemperatureLogsReportShape,
  BreachReportShape,
  BreachConfigReportShape,
  GeneralReportShape,
  GeneralReportKey,
  BreachConfigReportKey,
  BreachReportKey,
  TemperatureLogsReportKey,
  SensorReportKey,
  SensorStatsReportKey,
} from './types';
import _ from 'lodash';
import RNFS from 'react-native-fs';
import Mailer from 'react-native-mail';
import { parseAsync } from 'json2csv';
import { DatabaseService, ExportService } from '~common/services';
import { Sensor } from '~common/services/Database';

const specialChars = /[\/\?<>\\:\*\|":]/g;
const apparentlyTheseOnesAlso = /[\x00-\x1f\x80-\x9f]/g;
const andTheseOnes = /^\.+$/;

const sanitize = (input: string, replacement = '') =>
  input
    .replace(specialChars, replacement)
    .replace(apparentlyTheseOnesAlso, replacement)
    .replace(andTheseOnes, replacement)
    .split('')
    .splice(0, 255)
    .join('');

export class ReportManager {
  databaseService: DatabaseService;
  exportService: ExportService;
  deviceFeatureService: any;
  utils: UtilService;
  formatter: FormatService;

  constructor(
    databaseService: DatabaseService,
    exportService: ExportService,
    deviceFeatureService: any,
    utils: UtilService,
    formatter: FormatService
  ) {
    this.databaseService = databaseService;
    this.exportService = exportService;
    this.deviceFeatureService = deviceFeatureService;
    this.utils = utils;
    this.formatter = formatter;
  }

  getStats = async (
    from: number,
    to: number,
    id: string
  ): Promise<[SensorStatsReportKey[], SensorStatsReportShape[]]> => {
    const fields = Object.values(SensorStatsReportKey);
    const data = await this.databaseService.query(STATS, [from, to, id, id]);
    return [fields, data];
  };

  getSensorReport = async (id: string): Promise<[SensorReportKey[], SensorReportShape[]]> => {
    const fields = Object.values(SensorReportKey);
    const data = await this.databaseService.query(REPORT, [id]);
    return [fields, data];
  };

  getLogsReport = async (
    from: number,
    to: number,
    id: string
  ): Promise<[TemperatureLogsReportKey[], TemperatureLogsReportShape[]]> => {
    const fields = Object.values(TemperatureLogsReportKey);
    const data = await this.databaseService.query(LOGS_REPORT, [from, to, id]);

    return [fields, data];
  };

  getBreachReport = async (
    from: number,
    to: number,
    id: string
  ): Promise<[BreachReportKey[], BreachReportShape[]]> => {
    const fields = Object.values(BreachReportKey);
    const data = await this.databaseService.query(BREACH_REPORT, [id, from, to]);

    return [fields, data];
  };

  getBreachConfigReport = async (): Promise<
    [BreachConfigReportKey[], BreachConfigReportShape[]]
  > => {
    const fields = Object.values(BreachConfigReportKey);
    const data = await this.databaseService.query(BREACH_CONFIG_REPORT);

    return [fields, data];
  };

  getGeneralReport = (
    sensor: Sensor,
    username: string,
    comment: string
  ): [GeneralReportKey[], GeneralReportShape] => {
    const fields = Object.values(GeneralReportKey);
    const data = {
      [GeneralReportKey.Timezone]: this.deviceFeatureService.getDeviceTimezone(),
      [GeneralReportKey.Device]: this.deviceFeatureService.getDeviceModel(),
      [GeneralReportKey.SensorName]: sensor.name ?? sensor.macAddress,
      [GeneralReportKey.ExportedBy]: username,
      [GeneralReportKey.JobDescription]: comment,
    };

    return [fields, data];
  };

  getFullReport = async (
    sensor: Sensor,
    username: string,
    comment: string,
    from: number,
    to: number
  ): Promise<string> => {
    const { id: sensorId } = sensor;
    let csv = '';

    try {
      const [fields, data] = this.getGeneralReport(sensor, username, comment);
      const asCsv = await parseAsync(data, { fields });
      csv += `${asCsv}\n\n`;
    } catch (e) {}

    try {
      const [fields, data] = await this.getSensorReport(sensorId);
      const asCsv = await parseAsync(data, { fields });
      csv += `LAST PROGRAMMED\n${asCsv}\n\n`;
    } catch (e) {}

    try {
      const [fields, data] = await this.getBreachConfigReport();
      const asCsv = await parseAsync(data, { fields });
      csv += `BREACH CONFIGURATIONS\n${asCsv}\n\n`;
    } catch (e) {}

    try {
      const [fields, data] = await this.getStats(from, to, sensorId);
      const asCsv = await parseAsync(data, { fields });
      csv += `STATISTICS\n${asCsv}\n\n`;
    } catch (e) {}

    try {
      const [fields, data] = await this.getBreachReport(from, to, sensorId);
      const asCsv = await parseAsync(data, { fields });
      csv += `BREACHES\n${asCsv}\n\n`;
    } catch (e) {}

    try {
      const [fields, data] = await this.getLogsReport(from, to, sensorId);
      const chunkSize = 100;
      const numberOfChunks = Math.ceil(data.length / chunkSize);
      const chunkedData = _.chunk(data, numberOfChunks);
      const parsingPromises = chunkedData.map((chunk: TemperatureLogsReportShape[]) =>
        parseAsync(chunk, { fields })
      );
      const resolved = await Promise.all(parsingPromises);
      csv += `Logs\n${resolved.join('\n')}`;
    } catch (e) {}

    return csv;
  };

  getNewReportDirectory = (): string => {
    return `${RNFS.ExternalStorageDirectoryPath}/Download/cce`;
  };

  getNewReportFilePath = (sensor: Sensor): string => {
    const { name } = sensor;

    const directory = this.getNewReportDirectory();
    const now = this.formatter.fileNameDate(this.utils.now());
    const file = `${sanitize(name)}-${now}`;

    return `${directory}/${file}.csv`;
  };

  writeReport = async (filePath: string, csvReport: string): Promise<boolean> => {
    try {
      await RNFS.mkdir(this.getNewReportDirectory());
      await RNFS.writeFile(filePath, csvReport, 'utf8');

      return true;
    } catch (e) {
      return false;
    }
  };

  createAndWriteReport = async (
    sensor: Sensor,
    username: string,
    comment: string,
    from: number,
    to: number
  ): Promise<string> => {
    try {
      const report = await this.getFullReport(sensor, username, comment, from, to);
      const path = this.getNewReportFilePath(sensor);
      await this.writeReport(path, report);

      return path;
    } catch (e) {
      throw e;
    }
  };

  emailReport = async (
    sensor: Sensor,
    username: string,
    comment: string,
    from: number,
    to: number
  ): Promise<boolean> => {
    try {
      const path = await this.createAndWriteReport(sensor, username, comment, from, to);

      Mailer.mail(
        {
          subject: `Temperature log report for ${
            sensor.name ?? sensor.macAddress
          } from ${username}`,
          body: comment,
          attachments: [{ path, type: 'csv' }],
        },
        () => {}
      );

      return true;
    } catch (e) {
      return false;
    }
  };
}
