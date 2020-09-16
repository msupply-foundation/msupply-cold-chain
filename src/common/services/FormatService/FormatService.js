import moment from 'moment';

import { SPECIAL_CHARACTER, MILLISECONDS, FORMAT } from '~constants';

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

  batteryLevel = level => {
    return Number(level * 100).toFixed();
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

    return `${formattedDuration} between ${formattedMin} ${SPECIAL_CHARACTER.DASH} ${formattedMax}`;
  };
}
