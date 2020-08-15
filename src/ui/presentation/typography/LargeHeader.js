// import { Text } from 'react-native';
import { Text } from 'react-native-elements';

import { FONT, COLOUR, UI_ASSERTIONS } from '~constants';

const style = { fontSize: FONT.SIZE.XL, fontFamily: FONT.FAMILY.BOLD, color: COLOUR.PRIMARY };

export const LargeHeader = ({ children }) => {
  if (typeof children !== 'string') throw new Error(UI_ASSERTIONS.LARGE_HEADER);

  return <Text style={style}>{children}</Text>;
};
