import Animated from 'react-native-reanimated';
import { useMemoOne } from 'use-memo-one';

import { Centered, LargeRectangle } from '~layouts';
import { Header } from '~presentation/typography';
import { LowBattery, HotBreach, ColdBreach } from '~presentation/icons';
import { COLOUR } from '~constants';
import { useLoop } from '~hooks';

export const SensorStatus = ({ isInHotBreach, isInColdBreach, isLowBattery, temperature }) => {
  const animations = useMemoOne(() => ({
    temperatureAnimation: new Animated.Value(),
    isInHotBreachAnimation: new Animated.Value(),
    isInColdBreachAnimation: new Animated.Value(),
    isLowBatteryAnimation: new Animated.Value(),
  }));

  const configs = [
    { run: !!temperature, animation: animations.temperatureAnimation },
    { run: !!isInHotBreach, animation: animations.isInHotBreachAnimation },
    { run: !!isInColdBreach, animation: animations.isInColdBreachAnimation },
    { run: !!isLowBattery, animation: animations.isLowBatteryAnimation },
  ];

  useLoop(configs);

  return (
    <LargeRectangle colour={COLOUR.DANGER}>
      <Centered>
        <Animated.View
          style={{ position: 'absolute' }}
          opacity={animations.temperatureAnimation || 0}
        >
          <Header colour={COLOUR.WHITE}>{temperature ?? '3.2c'}</Header>
        </Animated.View>

        <Animated.View opacity={animations.isInHotBreachAnimation || 0}>
          <HotBreach />
        </Animated.View>

        <Animated.View
          style={{ position: 'absolute' }}
          opacity={animations.isInColdBreachAnimation || 0}
        >
          <ColdBreach />
        </Animated.View>

        <Animated.View
          style={{ position: 'absolute' }}
          opacity={animations.isLowBatteryAnimation || 0}
        >
          <LowBattery />
        </Animated.View>
      </Centered>
    </LargeRectangle>
  );
};
