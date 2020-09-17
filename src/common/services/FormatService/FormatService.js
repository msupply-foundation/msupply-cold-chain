import moment from 'moment';

import { SPECIAL_CHARACTER, MILLISECONDS, FORMAT } from '~constants';
import { t } from '~translations';

export class FormatService {
  getTickFormatter = () => {
    let currentDay = null;
    return tick => {
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

  deviceBatteryLevel = level => {
    return `${Number(level * 100).toFixed()}%`;
  };

  sensorBatteryLevel = level => {
    return `${level}%`;
  };

  headerTime = date => {
    return moment(date).format('HH:mm');
  };

  headerDate = date => {
    return moment(date).format('DD MMMM');
  };

  temperature = temperature => {
    return `${temperature}${SPECIAL_CHARACTER.DEGREE_CELSIUS}`;
  };

  listCumulativeBreach = ({ duration, minimumTemperature, maximumTemperature }) => {
    const formattedDuration = moment.duration(duration, 'seconds').humanize();
    const formattedMin = `${this.temperature(minimumTemperature)}`;
    const formattedMax = `${this.temperature(maximumTemperature)}`;

    return `${formattedDuration} ${t('BETWEEN')} ${formattedMin} ${
      SPECIAL_CHARACTER.DASH
    } ${formattedMax}`;
  };

  lastDownloadTime = timestamp => {
    return `${moment.duration(moment.unix(moment().unix() - timestamp)).humanize()} ${t('AGO')}`;
  };
}
