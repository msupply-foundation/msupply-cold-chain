import React, { FC } from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { FONT, COLOUR } from '~common/constants';

const defaultStyle = { fontSize: FONT.SIZE.MS, fontFamily: FONT.FAMILY.REGULAR };

interface NormalTextProps extends TextProps {
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
  ...textProps
}) => {
  const internalStyle = { ...defaultStyle, ...style, marginRight, color };

  // Setup default `Text` prop values
  const { numberOfLines, ellipsizeMode } = textProps;
  const internalNumberOfLines = numberOfLines ?? 1;
  const internalEllipsizeMode = ellipsizeMode ?? 'tail';

  return (
    <Text
      numberOfLines={internalNumberOfLines}
      ellipsizeMode={internalEllipsizeMode}
      style={internalStyle}
    >
      {children}
    </Text>
  );
};
