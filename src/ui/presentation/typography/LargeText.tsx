import React, { FC } from 'react';
import { Text } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontSize: FONT.SIZE.L, fontFamily: FONT.FAMILY.REGULAR };

interface LargeTextProps {
  children: string;
  color?: string;
}

export const LargeText: FC<LargeTextProps> = ({ children = '', color = COLOUR.WHITE }) => {
  const style = { ...baseStyle, color };

  return <Text style={style}>{children}</Text>;
};
