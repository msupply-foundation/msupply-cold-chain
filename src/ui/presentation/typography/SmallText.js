import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.S, fontFamily: FONT.FAMILY.REGULAR };

export const SmallText = ({ children = '', colour = COLOUR.PRIMARY, style = {} }) => {
  const internalStyle = { ...baseStyle, color: colour, ...style };

  return <Text style={internalStyle}>{children}</Text>;
};
