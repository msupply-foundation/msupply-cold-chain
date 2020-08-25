import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';

import { NormalText, MediumText } from '~presentation/typography';
import { MaybeTouchableContainer, SettingsRowLayout } from '~layouts';

export const SettingsLoadingIndicatorRow = ({
  label = '',
  subtext = '',
  isLoading = false,
  onPress,
  isDisabled = false,
}) => {
  return (
    <MaybeTouchableContainer isDisabled={isDisabled || isLoading} onPress={onPress}>
      <SettingsRowLayout
        Text={<MediumText colour={COLOUR.GREY_ONE}>{label}</MediumText>}
        Subtext={<NormalText colour={COLOUR.GREY_ONE}>{subtext}</NormalText>}
        RightComponent={
          isLoading ? <ActivityIndicator color={COLOUR.PRIMARY} size="large" /> : null
        }
      />
    </MaybeTouchableContainer>
  );
};
