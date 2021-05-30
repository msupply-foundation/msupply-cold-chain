import React, { FC } from 'react';
import { Text, TextStyle } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontSize: FONT.SIZE.S, fontFamily: FONT.FAMILY.REGULAR };

interface SmallTextProps {
  children: string;
  color?: COLOUR;
  style?: TextStyle;
}

export const SmallText: FC<SmallTextProps> = ({
  children = '',
  color = COLOUR.PRIMARY,
  style = {},
}) => {
  const internalStyle = { ...baseStyle, color, ...style };

  return <Text style={internalStyle}>{children}</Text>;
};
