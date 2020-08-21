import { Pressable, View } from 'react-native';
import { MediumText } from '~presentation/typography';
import { COLOUR, STYLE } from '~constants';

const style = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: STYLE.HEIGHT.SETTINGS_EDIT_BUTTON,
    borderRightColor: COLOUR.DIVIDER,
  },
};

export const SettingsEditButton = ({ text, onPress, isDisabled = false, border }) => {
  const internalStyle = { ...style.container, borderRightWidth: border ? 2 : 0 };
  const Container = isDisabled ? View : Pressable;

  return (
    <Container style={internalStyle} onPress={onPress}>
      <MediumText textAlign="center" colour={isDisabled ? COLOUR.GREY_TWO : COLOUR.GREY_ONE}>
        {text}
      </MediumText>
    </Container>
  );
};
