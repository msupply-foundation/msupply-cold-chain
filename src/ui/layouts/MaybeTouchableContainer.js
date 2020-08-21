import { View } from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

export const MaybeTouchableContainer = ({ style, isDisabled, onPress, children }) => {
  const Container = isDisabled ? View : TouchableNativeFeedback;

  return (
    <Container style={style} onPress={onPress}>
      {children}
    </Container>
  );
};
