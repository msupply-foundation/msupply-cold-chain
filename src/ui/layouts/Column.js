import { View } from 'react-native';

export const Column = ({
  alignItems = null,
  justifyContent = null,
  flexDirection = 'column',
  flex = null,
  style = {},
  children,
}) => {
  const internalStyle = { flexDirection, alignItems, justifyContent, flex, ...style };

  return <View style={internalStyle}>{children}</View>;
};
