import React from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';

import { LoadingModalLayout, FullScreenModal } from '~layouts';

import { LargeText } from '~presentation/typography';

export const WritingLogsModal = () => {
  const createReport = useSelector(state => state.report.creatingReport);

  return (
    <FullScreenModal isOpen={createReport}>
      <LoadingModalLayout
        LoadingIndicator={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
        Content={<LargeText> WRITING...</LargeText>}
      />
    </FullScreenModal>
  );
};
