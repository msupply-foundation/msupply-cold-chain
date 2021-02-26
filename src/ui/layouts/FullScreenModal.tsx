import React, { FC, ReactNode } from 'react';
import { Pressable, ViewProps } from 'react-native';
import Modal, { ModalProps } from 'react-native-modal';

import { COLOUR } from '../../common/constants';

const styles = {
  container: {
    backgroundColor: COLOUR.BACKGROUND_TWO,
    justifyContent: 'flex-end',
    flex: 1,
    alignItems: 'center',
  },
};

interface FullScreenModalProps extends Partial<ModalProps> {
  isOpen: boolean;
  onClose?: boolean;
  children: ReactNode;
  style?: ViewProps;
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
    >
      <Pressable style={internalStyle} onPress={onClose}>
        {children}
      </Pressable>
    </Modal>
  );
};
