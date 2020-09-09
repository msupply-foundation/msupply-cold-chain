import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { ICON, COLOUR } from '~constants';

export const Email = () => {
  return <FontAwesome name={ICON.EMAIL} color={COLOUR.SECONDARY} size={30} />;
};
