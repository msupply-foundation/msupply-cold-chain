import React, { FC } from 'react';

import { COLOUR } from '../../../common/constants';
import { Icon, ICON_NAME, ICON_SIZE } from './Icon';

export const QRCode: FC = () => {
  return <Icon size={ICON_SIZE.L} name={ICON_NAME.QR} color={COLOUR.PRIMARY} />;
};
