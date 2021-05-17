import React, { FC } from 'react';
import { View, ViewStyle } from 'react-native';

interface RowProps {
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

export const Row: FC<RowProps> = ({ alignItems, justifyContent, flex, style = {}, children }) => {
  const internalStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems,
    justifyContent,
    flex,
    ...style,
  };

  return <View style={internalStyle}>{children}</View>;
};
