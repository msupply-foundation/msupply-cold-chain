import React, { FC, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import Modal, { ModalProps } from 'react-native-modal';
import { COLOUR } from '~constants';

const styles: { container: ViewStyle } = {
  container: {
    backgroundColor: COLOUR.BACKGROUND_TWO,
    justifyContent: 'flex-end',
    flex: 1,
    alignItems: 'center',
  },
};

interface FullScreenModalProps extends Partial<ModalProps> {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  style?: ViewStyle;
}

export const FullScreenModal: FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  children,
  style,
  animationIn,
  animationOut,
}) => {
  const internalStyle = { ...styles.container, ...style };

  return (
    <Modal
      animationIn={animationIn}
      animationOut={animationOut}
      isVisible={isOpen}
      coverScreen
      style={{ margin: 0 }}
      useNativeDriver
      useNativeDriverForBackdrop
      onBackdropPress={onClose}
    >
      <View style={internalStyle}>{children}</View>
    </Modal>
  );
};
