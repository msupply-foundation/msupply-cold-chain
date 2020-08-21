import RNSlider from '@react-native-community/slider';

import { COLOUR } from '~constants';

export const Slider = ({
  minimumValue,
  maximumValue,
  isDisabled,
  onSlidingStart,
  onSlidingComplete,
  onValueChange,
  step,
  value,
  style,
}) => {
  return (
    <RNSlider
      style={style}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      minimumTrackTintColor={COLOUR.PRIMARY}
      maximumTrackTintColor={COLOUR.GREY_ONE}
      disabled={isDisabled}
      onSlidingStart={onSlidingStart}
      onSlidingComplete={onSlidingComplete}
      onValueChange={onValueChange}
      step={step}
      value={value}
      thumbTintColor={COLOUR.SECONDARY}
    />
  );
};
