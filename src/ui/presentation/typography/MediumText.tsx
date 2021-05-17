import React, { FC } from 'react';
import { Text } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontSize: FONT.SIZE.M, fontFamily: FONT.FAMILY.REGULAR };

interface MediumTextProps {
  children: string;
  color?: string;
}

export const MediumText: FC<MediumTextProps> = ({ children = '', color = COLOUR.OFF_WHITE }) => {
  const style = { ...baseStyle, color };

  return <Text style={style}>{children}</Text>;
};
