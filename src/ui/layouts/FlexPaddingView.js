import { View } from 'react-native';

export const FlexPaddingView = ({ height = 0, width = 0 }) => {
  const internalStyle = { height, width };
  return <View style={internalStyle} />;
};
