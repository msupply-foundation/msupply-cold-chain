import { MILLISECONDS } from '~constants';
import { useUtils } from './useDependency';
import { useEffect, useState } from 'react';
import { useOnAppFocus } from './useOnAppFocus';

export const useTime = (): number => {
  const utils = useUtils();
  const [time, setTime] = useState(utils.now());

  useOnAppFocus(() => setTime(utils.now()));

  useEffect(() => {
    const secondsUntilNextMinute = utils.timeUntilNextMinute(utils.now());
    const asMilliseconds = secondsUntilNextMinute * MILLISECONDS.ONE_SECOND;
    setTimeout(() => setTime(utils.now()), asMilliseconds);
  }, [utils, time]);

  return time;
};
