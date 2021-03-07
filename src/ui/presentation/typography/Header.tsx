import React, { FC, ReactNode } from 'react';
import { Text, TextStyle } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontSize: FONT.SIZE.XL, fontFamily: FONT.FAMILY.BOLD };

interface HeaderProps {
  children: ReactNode;
  color?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
  style?: TextStyle;
}

export const Header: FC<HeaderProps> = ({ children, color = COLOUR.PRIMARY, textAlign, style }) => {
  const internalStyle: TextStyle = {
    ...style,
    textAlign: textAlign ?? 'left',
    color,
    ...baseStyle,
  };

  return <Text style={internalStyle}>{children}</Text>;
};
