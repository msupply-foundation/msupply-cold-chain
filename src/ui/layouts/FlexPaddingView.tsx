import React, { FC } from 'react';
import { View } from 'react-native';

interface FlexPaddingViewProps {
  height?: number | string;
  width?: number | string;
}

// TODO: Deprecate
export const FlexPaddingView: FC<FlexPaddingViewProps> = ({ height = 0, width = 0 }) => {
  const internalStyle = { height, width };
  return <View style={internalStyle} />;
};
