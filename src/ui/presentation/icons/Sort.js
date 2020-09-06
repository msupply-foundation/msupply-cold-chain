import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { COLOUR, ICON } from '~constants';

export const Sort = ({ isAsc, isSorted }) => {
  const iconName = isSorted ? (isAsc && ICON.SORT_UP) || ICON.SORT_DOWN : ICON.SORT;
  return <FontAwesome name={iconName} color={COLOUR.GREY_ONE} size={20} />;
};
