import React, { FC } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { STYLE, ICON, COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const Lock: FC = () => {
  return <Icon size={ICON_SIZE.L} name={ICON_NAME.LOCK} color={COLOUR.PRIMARY} />;
};

export const UnLock: FC = () => {
  return <FontAwesome size={STYLE.ICON.SIZE.L} name={ICON.UNLOCK} color={COLOUR.PRIMARY} />;
};
