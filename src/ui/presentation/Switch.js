import { Switch as RNSwitch } from 'react-native';
import { COLOUR } from '~constants';

export const Switch = ({ onPress = null, isOn = false, isDisabled = false }) => {
  return (
    <RNSwitch
      value={isOn}
      onPress={onPress}
      trackColor={COLOUR.GREY_TWO}
      thumbColor={isOn ? COLOUR.PRIMARY : COLOUR.DANGER}
      disabled={isDisabled}
    />
  );
};
