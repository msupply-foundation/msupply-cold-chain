import { Pressable } from 'react-native';
import Modal from 'react-native-modal';

import { COLOUR } from '~constants';

const styles = {
  container: {
    backgroundColor: COLOUR.BACKGROUND_TWO,
    justifyContent: 'flex-end',
    flex: 1,
    alignItems: 'center',
  },
};

export const FullScreenModal = ({ isOpen, onClose, children, style }) => {
  const internalStyle = { ...styles.container, ...style };

  return (
    <Modal
      animationInTiming={1}
      isVisible={isOpen}
      coverScreen
      style={{ flex: 1, margin: 0 }}
      useNativeDriver
      hasBackdrop={false}
    >
      <Pressable style={internalStyle} onPress={onClose}>
        {children}
      </Pressable>
    </Modal>
  );
};
