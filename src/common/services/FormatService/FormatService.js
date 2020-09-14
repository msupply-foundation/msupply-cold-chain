import moment from 'moment';
import { FORMAT } from '~constants';

export class FormatService {
  getTickFormatter = () => {
    let currentDay = null;
    return tick => {
      let formatted = '';
      const nextCurrentDay = moment(tick * 1000).day();
      if (currentDay !== nextCurrentDay) {
        currentDay = moment(tick * 1000).day();
        formatted = moment(tick * 1000).format(`(D/M) ${FORMAT.DATE.HOUR_WITH_PERIOD}`);
      } else {
        formatted = moment(tick * 1000).format(FORMAT.DATE.HOUR_WITH_PERIOD);
      }

      return formatted;
    };
  };

  batteryLevel = level => {
    return Number(level * 100).toFixed();
  };
}
