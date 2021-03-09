import React, { FC } from 'react';
import { View, ViewStyle } from 'react-native';

interface CenteredProps {
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  style?: Partial<ViewStyle>;
  flex?: number;
}

export const Centered: FC<CenteredProps> = ({
  alignItems = 'center',
  justifyContent = 'center',
  style = {},
  children,
  flex,
}) => {
  const internalStyle = { alignItems, justifyContent, flex, ...style };

  return <View style={internalStyle}>{children}</View>;
};
