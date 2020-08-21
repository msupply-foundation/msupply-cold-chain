import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { STYLE, COLOUR, ICON } from '~constants';

export const LowBattery = () => {
  return <FontAwesome size={STYLE.ICON.SIZE.L} name={ICON.LOW_BATTERY} color={COLOUR.WHITE} />;
};
