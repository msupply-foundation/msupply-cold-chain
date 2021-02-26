import { Pressable } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';

import { Centered, SettingsRowLayout } from '~layouts';

import { LargeText } from '~presentation/typography';
import { Icon } from '../../presentation/icons/Icon';

const LeftIcon = ({ goBack }) => (
  <Pressable hitSlop={100} onPress={goBack}>
    <Centered style={{ marginTop: 10 }}>
      <Icon.Chevron direction="left" color={COLOUR.GREY_ONE} />
    </Centered>
  </Pressable>
);

export const SettingsStackHeader = ({ name, goBack }) => {
  return (
    <SettingsRowLayout
      LeftIcon={goBack ? <LeftIcon goBack={goBack} /> : null}
      Text={<LargeText colour={COLOUR.SECONDARY}>{t(name)}</LargeText>}
    />
  );
};
