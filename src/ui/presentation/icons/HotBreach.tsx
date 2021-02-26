import React, { FC } from 'react';
import { STYLE, COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME } from './Icon';

export const HotBreach: FC = () => {
  return <Icon size={STYLE.ICON.SIZE.L} name={ICON_NAME.HOT_BREACH} color={COLOUR.WHITE} />;
};
