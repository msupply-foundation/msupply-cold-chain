import React, { FC } from 'react';
import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Calendar: FC = () => {
  return <Icon name={ICON_NAME.CALENDAR} color={COLOUR.SECONDARY} size={ICON_SIZE.S} />;
};
