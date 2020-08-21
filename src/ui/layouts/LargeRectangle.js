import { View } from 'react-native';

import { COLOUR, STYLE } from '~constants';

const style = {
  width: STYLE.WIDTH.LARGE_RECTANGLE,
  height: STYLE.HEIGHT.LARGE_RECTANGLE,
  borderRadius: STYLE.BORDER.RADIUS.RECTANGLE,
};

export const LargeRectangle = ({ children, colour = COLOUR.PRIMARY }) => {
  const internalStyle = { ...style, backgroundColor: colour };
  return <View style={internalStyle}>{children}</View>;
};
