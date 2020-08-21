import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.M, fontFamily: FONT.FAMILY.REGULAR };

export const MediumText = ({ children = '', colour = COLOUR.OFF_WHITE }) => {
  const style = { ...baseStyle, color: colour };

  return <Text style={style}>{children}</Text>;
};
