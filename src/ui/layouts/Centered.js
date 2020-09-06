import { View } from 'react-native';

export const Centered = ({
  alignItems = 'center',
  justifyContent = 'center',
  style = {},
  children,
  flex = null,
}) => {
  const internalStyle = { alignItems, justifyContent, flex, ...style };

  return <View style={internalStyle}>{children}</View>;
};
