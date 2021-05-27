import React, { FC } from 'react';
import { Text, TextStyle } from 'react-native';
import { FONT, COLOUR } from '../../../common/constants';

const defaultStyle = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.REGULAR };

interface NormalTextProps {
  children?: string | number;
  color?: string;
  marginRight?: number;
  style?: TextStyle;
}

export const NormalText: FC<NormalTextProps> = ({
  children = '',
  color = COLOUR.WHITE,
  marginRight = 0,
  style = {},
}) => {
  const internalStyle = { ...defaultStyle, ...style, marginRight, color };

  return (
    <Text numberOfLines={1} ellipsizeMode="tail" style={internalStyle}>
      {children}
    </Text>
  );
};
