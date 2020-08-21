import { useWindowDimensions, View, Pressable } from 'react-native';

import { STYLE, COLOUR } from '~constants';
import { Divider } from '~presentation';

import { Column } from './Column';
import { FullScreenModal } from './FullScreenModal';

const style = {
  container: {
    backgroundColor: COLOUR.WHITE,
    borderRadius: STYLE.BORDER.RADIUS.RECTANGLE,
    maxHeight: STYLE.HEIGHT.SETTINGS_EDIT_MODAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export const SettingsEditModalLayout = ({ Title, Content, ButtonGroup, isOpen, onClose }) => {
  const { width } = useWindowDimensions();

  const internalContentContainerStyle = { ...style.container, width: width * 0.95 };
  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} style={{ paddingBottom: width * 0.05 }}>
      <Pressable onPress={null}>
        <Column style={internalContentContainerStyle}>
          <View style={{ paddingVertical: 20 }}>{Title}</View>
          <Divider width={STYLE.WIDTH.DIVIDER_NEARLY_FULL} />

          <Column
            justifyContent="center"
            style={{ minHeight: STYLE.HEIGHT.SETTINGS_EDIT_CONTENT_AREA }}
          >
            {Content}
          </Column>

          {ButtonGroup}
        </Column>
      </Pressable>
    </FullScreenModal>
  );
};
