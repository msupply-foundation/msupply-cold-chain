import React, { FC } from 'react';
import { View } from 'react-native';
import { STYLE, COLOUR } from '../../common/constants';

interface DividerProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export const Divider: FC<DividerProps> = ({
  width = STYLE.WIDTH.DIVIDER_FULL,
  height = 2,
  backgroundColor = COLOUR.DIVIDER,
}) => {
  return <View style={{ backgroundColor, width, height }} />;
};
