import { View } from 'react-native';

export const Centered = ({
  alignItems = 'center',
  justifyContent = 'center',
  style = {},
  children,
}) => {
  const internalStyle = { alignItems, justifyContent, ...style };

  return <View style={internalStyle}>{children}</View>;
};
