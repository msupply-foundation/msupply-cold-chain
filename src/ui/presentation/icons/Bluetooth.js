import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { COLOUR, ICON } from '~constants';

export const Bluetooth = () => {
  return <FontAwesome name={ICON.BLUETOOTH} color={COLOUR.WHITE} size={150} />;
};
