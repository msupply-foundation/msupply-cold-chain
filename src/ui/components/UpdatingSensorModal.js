import React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';

import { LoadingModalLayout, FullScreenModal } from '~layouts';

import { LargeText } from '~presentation/typography';
import { ProgramSelector } from '../../features/Bluetooth';

export const UpdatingSensorModal = () => {
  const isUpdating = useSelector(ProgramSelector.isProgramming);

  return (
    <FullScreenModal isOpen={isUpdating}>
      <LoadingModalLayout
        LoadingIndicator={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
        Content={<LargeText>{t('UPDATING')}</LargeText>}
      />
    </FullScreenModal>
  );
};
