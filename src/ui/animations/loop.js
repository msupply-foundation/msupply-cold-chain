import Animated, { Easing } from 'react-native-reanimated';
import { delay } from 'react-native-redash';

const { and, not, timing, Clock, Value, set, cond, eq, block, startClock, clockRunning } = Animated;

export const loop = loopConfig => {
  const {
    clock,
    easing,
    autoStart,
    duration,
    startDelay,
    animationDelay = 4000,
    shouldRun = true,
  } = {
    clock: new Clock(),
    easing: Easing.linear,
    duration: 1000,
    boomerang: false,

    ...loopConfig,
    autoStart: true,
  };

  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
    startDelayed: new Value(0),
    animationDelayed: new Value(1),
    start: new Value(0),
  };

  const config = {
    toValue: new Value(1),
    duration,
    easing,
  };

  return block([
    delay(set(state.startDelayed, 1), cond(eq(state.startDelayed, 0), startDelay, 0)),
    cond(
      eq(state.startDelayed, 1),
      block([
        cond(
          cond(
            and(not(clockRunning(clock)), (autoStart ? 1 : 0) && (shouldRun ? 1 : 0)),
            startClock(clock)
          )
        ),
        timing(clock, state, config),
        cond(and(state.finished), [
          set(state.finished, 0),
          set(state.time, 0),
          set(state.frameTime, 0),
          cond(
            config.toValue,
            set(config.toValue, 0),
            delay(set(config.toValue, 1), animationDelay)
          ),
        ]),
        state.position,
      ])
    ),
  ]);
};
