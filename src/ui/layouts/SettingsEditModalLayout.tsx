import React, { FC, ReactNode } from 'react';
import { useWindowDimensions, View, Pressable, ViewStyle } from 'react-native';
import { STYLE, COLOUR } from '../../common/constants';
import { Divider } from '../presentation';
import { Column } from './Column';
import { FullScreenModal } from './FullScreenModal';

const style: { container: ViewStyle } = {
  container: {
    backgroundColor: COLOUR.WHITE,
    borderRadius: STYLE.BORDER.RADIUS.RECTANGLE,
    maxHeight: STYLE.HEIGHT.SETTINGS_EDIT_MODAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

interface SettingsEditModalLayoutProps {
  Title: ReactNode;
  Content: ReactNode;
  ButtonGroup: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsEditModalLayout: FC<SettingsEditModalLayoutProps> = ({
  Title,
  Content,
  ButtonGroup,
  isOpen,
  onClose,
}) => {
  const { width } = useWindowDimensions();

  const internalContentContainerStyle = { ...style.container, width: width * 0.95 };
  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} style={{ paddingBottom: 50 }}>
      <Pressable onPress={null}>
        <Column style={internalContentContainerStyle}>
          <View style={{ paddingVertical: 20 }}>{Title}</View>
          <Divider width={STYLE.WIDTH.DIVIDER_NEARLY_FULL} />

          <Column
            justifyContent="center"
            style={{ maxHeight: STYLE.HEIGHT.SETTINGS_EDIT_CONTENT_AREA }}
          >
            {Content}
          </Column>

          {ButtonGroup}
        </Column>
      </Pressable>
    </FullScreenModal>
  );
};
