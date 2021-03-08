import React, { FC } from 'react';
import { Text } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const style = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.REGULAR };

interface NormalTextProps {
  children: string | number;
  color: string;
  marginRight: number;
}

export const NormalText: FC<NormalTextProps> = ({
  children = '',
  color = COLOUR.WHITE,
  marginRight = 0,
}) => {
  const internalStyle = { ...style, marginRight, color };

  return <Text style={internalStyle}>{children}</Text>;
};
