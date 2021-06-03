import { UtilService } from '~services/UtilService';
import moment from 'moment';

import { UnixTimestamp } from '~common/types/common';
import { BreachConfigurationState } from '~features/Entities/BreachConfiguration/BreachConfigurationSlice';
import { SPECIAL_CHARACTER, MILLISECONDS, FORMAT } from '~constants';
import { t } from '~translations';

export class FormatService {
  utils: UtilService;

  constructor(utilService: UtilService) {
    this.utils = utilService;
  }

  getTickFormatter = (): ((tick: number) => string) => {
    let currentDay: null | number = null;
    return (tick: number) => {
      let formatted = '';
      const nextCurrentDay = moment(tick * 1000).day();
      if (currentDay !== nextCurrentDay) {
        currentDay = moment(tick * MILLISECONDS.ONE_SECOND).day();
        formatted = moment(tick * MILLISECONDS.ONE_SECOND).format(
          `(D/M) ${FORMAT.DATE.HOUR_WITH_PERIOD}`
        );
      } else {
        formatted = moment(tick * MILLISECONDS.ONE_SECOND).format(FORMAT.DATE.HOUR_WITH_PERIOD);
      }

      return formatted;
    };
  };

  deviceBatteryLevel = (level: number): string => {
    return `${Number(level * 100).toFixed()}%`;
  };

  sensorBatteryLevel = (level: number): string => {
    return level == null ? t('NOT_AVAILABLE') : `${level}%`;
  };

  headerTime = (date: Date): string => {
    return moment(date).format('HH:mm');
  };

  headerDate = (date: Date): string => {
    return moment(date).format('DD MMMM');
  };

  fileDate = (date: number): string => {
    return moment.unix(date).format('DD-MM-YYYY-HHmmss');
  };

  temperature = (temperature: number): string => {
    return `${temperature}${SPECIAL_CHARACTER.DEGREE_CELSIUS}`;
  };

  dateRange = (from: UnixTimestamp, to: UnixTimestamp): string => {
    const fromDate = moment.unix(from);
    const toDate = moment.unix(to);

    return `${fromDate.format('MMM Do')} - ${toDate.format('MMM Do')}`;
  };

  listCumulativeBreach = ({
    duration,
    minimumTemperature,
    maximumTemperature,
  }: {
    duration: number;
    minimumTemperature: number;
    maximumTemperature: number;
  }): string => {
    const formattedDuration = moment.duration(duration, 'seconds').humanize();
    const formattedMin = `${this.temperature(minimumTemperature)}`;
    const formattedMax = `${this.temperature(maximumTemperature)}`;

    return `${formattedDuration} ${t('BETWEEN')} ${formattedMin} ${
      SPECIAL_CHARACTER.DASH
    } ${formattedMax}`;
  };

  lastDownloadTime = (timestamp: number, now = moment().unix()): string => {
    return `${moment.duration(now - timestamp, 'seconds').humanize()} ${t('AGO')}`;
  };

  toCelsius = (toFormat: string | number): string => {
    const asString = String(toFormat);
    return `${asString}${SPECIAL_CHARACTER.DEGREE_CELSIUS}`;
  };

  breachConfigRow = (config: BreachConfigurationState): string => {
    const { id, duration, maximumTemperature, minimumTemperature } = config;

    const isHot = id.includes('HOT');
    const direction = isHot ? t('AND_ABOVE') : t('AND_BELOW');
    const temperature = isHot ? minimumTemperature : maximumTemperature;

    return `${t('DURATION')}: ${this.utils.millisecondsToMinutes(duration)} ${t('MINUTES')}, ${t(
      'TEMPERATURE'
    )}: ${this.toCelsius(temperature)} ${direction}`;
  };
}
