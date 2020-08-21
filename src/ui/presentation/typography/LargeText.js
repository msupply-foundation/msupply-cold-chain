import { Text } from 'react-native';

import { FONT, COLOUR, UI_ASSERTIONS } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.L, fontFamily: FONT.FAMILY.REGULAR };

export const LargeText = ({ children = '', colour = COLOUR.WHITE }) => {
  if (!(typeof children === 'string' || typeof children === 'number')) {
    throw new Error(UI_ASSERTIONS.LARGE_TEXT);
  }

  const style = { ...baseStyle, color: colour };

  return <Text style={style}>{children}</Text>;
};
