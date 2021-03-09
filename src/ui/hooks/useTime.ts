import { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { useOnAppFocus } from './useOnAppFocus';

export const useTime = (): Moment => {
  const [time, setTime] = useState(moment());

  useOnAppFocus(() => setTime(moment()));

  useEffect(() => {
    const nextMinute = moment(time).add(1, 'minute').startOf('minute');
    const diff = nextMinute.diff(time, 'ms');
    setTimeout(() => setTime(moment()), diff);
  }, [time]);

  return time;
};
