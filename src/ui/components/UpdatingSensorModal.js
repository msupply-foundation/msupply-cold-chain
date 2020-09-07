import React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';

import { LoadingModalLayout, FullScreenModal } from '~layouts';

import { LargeText } from '~presentation/typography';
import { UpdateSelector } from '../../features/bluetooth';

export const UpdatingSensorModal = () => {
  const isUpdating = useSelector(UpdateSelector.isUpdating);

  return (
    <FullScreenModal isOpen={isUpdating}>
      <LoadingModalLayout
        LoadingIndicator={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
        Content={<LargeText>{t('UPDATING')}</LargeText>}
      />
    </FullScreenModal>
  );
};
