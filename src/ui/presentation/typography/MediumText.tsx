import React, { FC } from 'react';
import { Text } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const baseStyle = { fontSize: FONT.SIZE.M, fontFamily: FONT.FAMILY.REGULAR };

interface MediumTextProps {
  children: string;
  color?: string;
  paddingBottom?: number;
}

export const MediumText: FC<MediumTextProps> = ({
  children = '',
  color = COLOUR.OFF_WHITE,
  paddingBottom,
}) => {
  const style = { ...baseStyle, color, paddingBottom };

  return <Text style={style}>{children}</Text>;
};
