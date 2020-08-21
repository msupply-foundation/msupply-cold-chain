import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLOUR, STYLE, ICON } from '~constants';

export const Cog = () => {
  return <FontAwesome name={ICON.SETTINGS} size={STYLE.ICON.SIZE.S} color={COLOUR.OFF_WHITE} />;
};
