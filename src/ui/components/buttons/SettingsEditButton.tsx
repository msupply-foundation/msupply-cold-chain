import React, { FC } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { MediumText } from '../../presentation/typography';
import { COLOUR, STYLE } from '../../../common/constants';

const style: { container: ViewStyle } = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: STYLE.HEIGHT.SETTINGS_EDIT_BUTTON,
    borderRightColor: COLOUR.DIVIDER,
  },
};

interface SettingsEditButtonProps {
  text: string;
  onPress: () => void;
  isDisabled?: boolean;
  border?: boolean;
}

export const SettingsEditButton: FC<SettingsEditButtonProps> = ({
  text,
  onPress,
  isDisabled = false,
  border = false,
}) => {
  const internalStyle = { ...style.container, borderRightWidth: border ? 2 : 0 };
  const Container = isDisabled ? View : Pressable;

  return (
    <Container style={internalStyle} onPress={onPress}>
      <MediumText colour={isDisabled ? COLOUR.GREY_TWO : COLOUR.GREY_ONE}>{text}</MediumText>
    </Container>
  );
};
