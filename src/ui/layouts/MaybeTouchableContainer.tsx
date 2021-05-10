import React, { ElementType, FC } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';

interface MaybeTouchableContainerProps {
  style?: ViewStyle;
  isDisabled: boolean;
  onPress: (() => void) | null;
}

export const MaybeTouchableContainer: FC<MaybeTouchableContainerProps> = ({
  style,
  isDisabled,
  onPress,
  children,
}) => {
  const Container = (isDisabled ? View : Pressable) as ElementType;

  return (
    <Container style={style} onPress={onPress}>
      {children}
    </Container>
  );
};
