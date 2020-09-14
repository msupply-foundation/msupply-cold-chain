import { Text } from 'react-native';

import { FONT, COLOUR } from '~constants';

const style = { fontSize: FONT.SIZE.XL, fontFamily: FONT.FAMILY.BOLD };

export const Header = ({ children, colour = COLOUR.PRIMARY }) => {
  const internalStyle = { ...style, color: colour };

  return <Text style={internalStyle}>{children}</Text>;
};
