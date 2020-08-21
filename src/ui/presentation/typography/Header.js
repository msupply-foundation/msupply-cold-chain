import { Text } from 'react-native';

import { FONT, COLOUR, UI_ASSERTIONS } from '~constants';

const style = { fontSize: FONT.SIZE.L, fontFamily: FONT.FAMILY.BOLD };

export const Header = ({ children, colour = COLOUR.PRIMARY }) => {
  if (!(typeof children === 'string' || typeof children === 'number')) {
    throw new Error(UI_ASSERTIONS.LARGE_HEADER);
  }

  const internalStyle = { ...style, color: colour };

  return <Text style={internalStyle}>{children}</Text>;
};
