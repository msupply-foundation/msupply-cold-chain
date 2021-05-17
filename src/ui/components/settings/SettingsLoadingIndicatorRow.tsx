import React, { FC } from 'react';
import { ActivityIndicator } from 'react-native';
import { COLOUR } from '../../../common/constants';
import { NormalText, MediumText } from '../../presentation/typography';
import { MaybeTouchableContainer, SettingsRowLayout } from '../../layouts';

interface SettingsLoadingIndicatorRowProps {
  label: string;
  subtext?: string;
  isLoading: boolean;
  onPress: () => void;
  isDisabled?: boolean;
}

export const SettingsLoadingIndicatorRow: FC<SettingsLoadingIndicatorRowProps> = ({
  label = '',
  subtext = '',
  isLoading = false,
  onPress,
  isDisabled = false,
}) => {
  return (
    <MaybeTouchableContainer isDisabled={isDisabled || isLoading} onPress={onPress}>
      <SettingsRowLayout
        Text={<MediumText color={COLOUR.GREY_ONE}>{label}</MediumText>}
        Subtext={<NormalText color={COLOUR.GREY_ONE}>{subtext}</NormalText>}
        RightComponent={
          isLoading ? <ActivityIndicator color={COLOUR.PRIMARY} size="large" /> : null
        }
      />
    </MaybeTouchableContainer>
  );
};
