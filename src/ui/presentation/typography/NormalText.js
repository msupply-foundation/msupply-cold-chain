import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.REGULAR };

export const NormalText = ({ children = '', colour = COLOUR.WHITE, marginRight }) => {
  const internalStyle = { ...baseStyle, marginRight, color: colour };

  return <Text style={internalStyle}>{children}</Text>;
};
