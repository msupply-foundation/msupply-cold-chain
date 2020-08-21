import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { STYLE, UI_ASSERTIONS, COLOUR, ICON } from '~constants';

const ICON_LOOKUP = {
  left: ICON.CHEVRON_LEFT,
  right: ICON.CHEVRON_RIGHT,
};

export const Chevron = ({ direction, colour = COLOUR.OFF_WHITE }) => {
  if (!(direction === 'left' || direction === 'right')) {
    throw new Error(UI_ASSERTIONS.ICON_CHEVRON_DIRECTION);
  }

  const iconName = ICON_LOOKUP[direction];

  return <FontAwesome size={STYLE.ICON.SIZE.S} name={iconName} color={colour} />;
};
