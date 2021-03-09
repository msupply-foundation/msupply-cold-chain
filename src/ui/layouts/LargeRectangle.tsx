import React, { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import { COLOUR, STYLE } from '../../common/constants';

const style: ViewStyle = {
  width: STYLE.WIDTH.LARGE_RECTANGLE,
  height: STYLE.HEIGHT.LARGE_RECTANGLE,
  borderRadius: STYLE.BORDER.RADIUS.RECTANGLE,
};

interface LargeRectangleProps {
  color: string;
}

export const LargeRectangle: FC<LargeRectangleProps> = ({ children, color = COLOUR.PRIMARY }) => {
  const internalStyle = { ...style, backgroundColor: color };
  return <View style={internalStyle}>{children}</View>;
};
