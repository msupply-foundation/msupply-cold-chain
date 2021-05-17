import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '../../../common/constants';
import { t } from '../../../common/translations';
import { ProgramSelector } from '../../../features';

import { LoadingModalLayout, FullScreenModal } from '../../layouts';
import { LargeText } from '../../presentation/typography';

interface ConnectingWithSensorModalProps {
  macAddress: string;
}

export const ConnectingWithSensorModal: FC<ConnectingWithSensorModalProps> = ({ macAddress }) => {
  const { [macAddress]: isConnecting } = useSelector(ProgramSelector.programmingByMac);

  return (
    <FullScreenModal isOpen={isConnecting}>
      <LoadingModalLayout
        LoadingIndicator={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
        Content={<LargeText>{t('CONNECTING')}</LargeText>}
      />
    </FullScreenModal>
  );
};
