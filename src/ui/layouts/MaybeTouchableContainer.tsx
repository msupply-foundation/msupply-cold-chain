import React, { ElementType, FC } from 'react';
import { View, ViewProps } from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

interface MaybeTouchableContainerProps {
  style?: ViewProps;
  isDisabled: boolean;
  onPress: (() => void) | null;
}

export const MaybeTouchableContainer: FC<MaybeTouchableContainerProps> = ({
  style,
  isDisabled,
  onPress,
  children,
}) => {
  const Container = (isDisabled ? View : TouchableNativeFeedback) as ElementType;

  return (
    <Container style={style} onPress={onPress}>
      {children}
    </Container>
  );
};
