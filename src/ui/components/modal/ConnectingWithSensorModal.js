import React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';
import { ProgramSelector } from '~features';

import { LoadingModalLayout, FullScreenModal } from '~layouts';
import { LargeText } from '~presentation/typography';

export const ConnectingWithSensorModal = ({ macAddress }) => {
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
