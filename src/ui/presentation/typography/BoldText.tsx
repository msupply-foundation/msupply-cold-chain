import React, { FC } from 'react';
import { Text, TextStyle } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontFamily: FONT.FAMILY.BOLD };

interface BoldTextProps {
  children?: string;
  colour?: string;
  fontSize?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
}

export const BoldText: FC<BoldTextProps> = ({
  children = '',
  colour = COLOUR.PRIMARY,
  fontSize = FONT.SIZE.MS,
  textAlign = 'left',
  style = {},
}) => {
  const internalStyle = { ...style, textAlign, color: colour, fontSize, ...baseStyle };
  return <Text style={internalStyle}>{children}</Text>;
};
