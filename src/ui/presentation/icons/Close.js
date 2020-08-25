import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { COLOUR, ICON } from '~constants';

export const Close = () => {
  return <FontAwesome name={ICON.CLOSE} color={COLOUR.DANGER} size={50} />;
};
