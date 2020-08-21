import Animated from 'react-native-reanimated';

import { loop } from '~animations';

const { set, useCode } = Animated;

export const useLoop = animations => {
  const configs = animations.map(({ animation, run }, i) => ({
    animation,
    config: {
      duration: 1000,
      boomerang: true,
      startDelay: i * 1500,
      shouldRun: run,
      autoStart: true,
    },
    run,
  }));

  configs.forEach(({ animation, config }) => {
    useCode(() => set(animation, loop(config)));
  });
};
