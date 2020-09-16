import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.BOLD };

export const BoldText = ({ children = '', colour = COLOUR.PRIMARY, textAlign, style }) => {
  const internalStyle = { ...style, textAlign, color: colour, ...baseStyle };
  return <Text style={internalStyle}>{children}</Text>;
};
