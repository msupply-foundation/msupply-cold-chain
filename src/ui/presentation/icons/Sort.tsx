import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

interface SortProps {
  isAsc: boolean;
  isSorted: boolean;
}

export const Sort: FC<SortProps> = ({ isAsc, isSorted }) => {
  const iconName = isSorted ? (isAsc && ICON_NAME.SORT_UP) || ICON_NAME.SORT_DOWN : ICON_NAME.SORT;
  return <Icon name={iconName} color={COLOUR.GREY_ONE} size={ICON_SIZE.S} />;
};
