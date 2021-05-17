import React, { FC } from 'react';
import { Text, TextStyle } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.BOLD };

interface BoldTextProps {
  children?: string;
  colour?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
}

export const BoldText: FC<BoldTextProps> = ({
  children = '',
  colour = COLOUR.PRIMARY,
  textAlign = 'left',
  style = {},
}) => {
  const internalStyle = { ...style, textAlign, color: colour, ...baseStyle };
  return <Text style={internalStyle}>{children}</Text>;
};
