import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const baseStyle = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.BOLD };

export const BoldText = ({ children = '', colour = COLOUR.PRIMARY }) => {
  const style = { ...baseStyle, color: colour };

  return <Text style={style}>{children}</Text>;
};
