import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.S, fontFamily: FONT.FAMILY.REGULAR };

export const SmallText = ({ children = '', colour = COLOUR.PRIMARY }) => {
  const style = { ...baseStyle, color: colour };

  return <Text style={style}>{children}</Text>;
};
