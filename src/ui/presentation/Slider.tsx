import React, { FC } from 'react';
import { ViewStyle } from 'react-native';
import RNSlider from '@react-native-community/slider';

import { COLOUR } from '../../common/constants';

interface SliderProps {
  minimumValue: number;
  maximumValue: number;
  isDisabled?: boolean;
  onSlidingStart?: () => void;
  onSlidingComplete: (newValue: number) => void;
  onValueChange?: () => void;
  step: number;
  value: number;
  style: ViewStyle;
}

export const Slider: FC<SliderProps> = ({
  minimumValue,
  maximumValue,
  isDisabled = false,
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
