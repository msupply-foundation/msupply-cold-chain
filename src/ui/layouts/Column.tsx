import React, { FC } from 'react';
import { View, ViewStyle } from 'react-native';

interface ColumnProps {
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  flex?: number;
  style?: ViewStyle;
}

export const Column: FC<ColumnProps> = ({
  alignItems,
  justifyContent,
  flex,
  style = {},
  children,
}) => {
  const internalStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems,
    justifyContent,
    flex,
    ...style,
  };

  return <View style={internalStyle}>{children}</View>;
};
