import React, { FC } from 'react';
import { Switch as RNSwitch } from 'react-native';
import { COLOUR } from '../../common/constants';

interface SwitchProps {
  onPress: () => void;
  isOn?: boolean;
  isDisabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({ onPress, isOn = false, isDisabled = false }) => {
  return (
    <RNSwitch
      value={isOn}
      onValueChange={onPress}
      trackColor={{ false: COLOUR.GREY_TWO, true: COLOUR.GREY_TWO }}
      thumbColor={isOn ? COLOUR.PRIMARY : COLOUR.DANGER}
      disabled={isDisabled}
    />
  );
};
