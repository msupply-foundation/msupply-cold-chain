import { NormalText, MediumText } from '~presentation/typography';
import { MaybeTouchableContainer, SettingsRowLayout } from '~layouts';
import { COLOUR } from '~constants';

export const SettingsItem = ({
  label = '',
  subtext = '',
  LeftIcon = null,
  RightComponent = null,
  onPress,
  isDisabled = false,
}) => (
  <MaybeTouchableContainer isDisabled={isDisabled} onPress={onPress}>
    <SettingsRowLayout
      Text={<MediumText colour={COLOUR.GREY_ONE}>{label}</MediumText>}
      Subtext={<NormalText colour={COLOUR.GREY_ONE}>{subtext}</NormalText>}
      LeftIcon={LeftIcon}
      RightComponent={RightComponent}
    />
  </MaybeTouchableContainer>
);
