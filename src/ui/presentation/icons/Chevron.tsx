import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

const ICON_LOOKUP = {
  left: ICON_NAME.CHEVRON_LEFT,
  right: ICON_NAME.CHEVRON_RIGHT,
  up: ICON_NAME.CHEVRON_UP,
  down: ICON_NAME.CHEVRON_DOWN,
};

interface ChevronProps {
  direction?: 'left' | 'right' | 'up' | 'down';
  color?: COLOUR;
}

export const Chevron: FC<ChevronProps> = ({ direction = 'right', color = COLOUR.OFF_WHITE }) => {
  const iconName = ICON_LOOKUP[direction];

  return <Icon size={ICON_SIZE.S} name={iconName} color={color} />;
};
