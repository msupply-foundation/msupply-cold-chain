import moment from 'moment';
import { FORMAT } from '~constants';

export const tickFormat = tick => moment(tick).format(FORMAT.DATE.HOUR_WITH_PERIOD);
