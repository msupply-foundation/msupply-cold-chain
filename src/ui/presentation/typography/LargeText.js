import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.L, fontFamily: FONT.FAMILY.REGULAR };

export const LargeText = ({ children = '', colour = COLOUR.WHITE }) => {
  const style = { ...baseStyle, color: colour };

  return <Text style={style}>{children}</Text>;
};
