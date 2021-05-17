import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

type MapProps = {
  color: COLOUR;
};

export const Map: FC<MapProps> = ({ color = COLOUR.OFF_WHITE }) => {
  return <Icon name={ICON_NAME.MAP} size={ICON_SIZE.S} color={color} />;
};
