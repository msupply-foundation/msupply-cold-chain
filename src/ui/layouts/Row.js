import { View } from 'react-native';

export const Row = ({
  alignItems = null,
  justifyContent = null,
  flex = null,
  flexDirection = 'row',
  style = {},
  children,
}) => {
  const internalStyle = { flexDirection, alignItems, justifyContent, flex, ...style };

  return <View style={internalStyle}>{children}</View>;
};
