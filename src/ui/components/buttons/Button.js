import { Pressable } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';

import { STYLE, COLOUR } from '~constants';
import { BoldText } from '~presentation/typography';
import { Centered } from '~layouts';

const style = {
  borderRadius: STYLE.BORDER.RADIUS.NORMAL,
  borderWidth: STYLE.BORDER.WIDTH.NORMAL,
  width: STYLE.WIDTH.NORMAL_BUTTON,
  height: STYLE.HEIGHT.NORMAL_BUTTON,
  borderColor: COLOUR.OFF_WHITE,
};

export const Button = ({ text, onPress, isInModal = false }) => {
  const Container = isInModal ? BorderlessButton : Pressable;

  return (
    <Container onPress={onPress}>
      <Centered style={style}>
        <BoldText colour={COLOUR.OFF_WHITE}>{text}</BoldText>
      </Centered>
    </Container>
  );
};
