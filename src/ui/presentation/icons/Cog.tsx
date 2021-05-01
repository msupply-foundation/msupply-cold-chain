import React, { FC } from 'react';
import { COLOUR } from '~constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

interface CogProps {
  color: COLOUR;
}

export const Cog: FC<CogProps> = ({ color = COLOUR.OFF_WHITE }) => {
  return <Icon name={ICON_NAME.SETTINGS} size={ICON_SIZE.S} color={color} />;
};
