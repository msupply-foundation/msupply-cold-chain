import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { COLOUR, ICON } from '~constants';

export const Calendar = () => {
  return <FontAwesome name={ICON.CALENDAR} color={COLOUR.SECONDARY} size={20} />;
};
