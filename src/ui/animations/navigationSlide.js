import { Animated } from 'react-native';

const CLAMP = 'clamp';

export const navigationSlide = ({ current, next, inverted, layouts: { screen } }) => {
  const { progress: currentProgress } = current;
  const { progress: nextProgress } = next ?? {};
  const { width } = screen;

  const currentProgressConfig = { inputRange: [0, 1], outputRange: [0, 1], extrapolate: CLAMP };
  const nextProgressConfig = { inputRange: [0, 1], outputRange: [0, 1], extrapolate: CLAMP };

  const base = currentProgress.interpolate(currentProgressConfig);
  const addition = next ? nextProgress.interpolate(nextProgressConfig) : 0;
  const newProgress = Animated.add(base, addition);

  const hidden = width;
  const shown = width * -0.3;
  const xConfig = { inputRange: [0, 1, 2], outputRange: [hidden, 0, shown], extrapolate: CLAMP };
  const translateXBase = newProgress.interpolate(xConfig);
  const translateX = Animated.multiply(translateXBase, inverted);

  return {
    cardStyle: {
      transform: [
        {
          translateX,
        },
      ],
    },
  };
};
