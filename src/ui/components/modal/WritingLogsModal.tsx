import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';
import { COLOUR } from '../../../common/constants';
import { LoadingModalLayout, FullScreenModal } from '../../layouts';
import { LargeText } from '../../presentation/typography';
import { RootState } from '../../../common/store/store';

export const WritingLogsModal: FC = () => {
  const creating = useSelector((state: RootState) => state.report.creating);

  return (
    <FullScreenModal isOpen={creating}>
      <LoadingModalLayout
        LoadingIndicator={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
        Content={<LargeText> WRITING...</LargeText>}
      />
    </FullScreenModal>
  );
};
