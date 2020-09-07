import React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';

import { LoadingModalLayout, FullScreenModal } from '~layouts';

import { LargeText } from '~presentation/typography';
import { NewSensorSelector } from '../../features/bluetooth';

export const ConnectingWithSensorModal = ({ macAddress }) => {
  const { [macAddress]: isConnecting } = useSelector(NewSensorSelector.isConnecting);

  return (
    <FullScreenModal isOpen={isConnecting}>
      <LoadingModalLayout
        LoadingIndicator={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
        Content={<LargeText>{t('CONNECTING')}</LargeText>}
      />
    </FullScreenModal>
  );
};
