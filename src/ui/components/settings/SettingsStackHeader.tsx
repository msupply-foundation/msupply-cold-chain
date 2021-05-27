import React, { FC } from 'react';
import { Pressable } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';
import { Centered, SettingsRowLayout } from '~layouts';
import { MediumText } from '~presentation/typography';
import { Icon } from '~presentation/icons';

interface LeftIconProps {
  goBack: () => void;
}

const LeftIcon: FC<LeftIconProps> = ({ goBack }) => (
  <Pressable hitSlop={100} onPress={goBack}>
    <Centered style={{ marginTop: 10 }}>
      <Icon.Chevron direction="left" color={COLOUR.GREY_ONE} />
    </Centered>
  </Pressable>
);

interface SettingsStackHeaderProps {
  name: string;
  goBack: (() => void) | null;
}

export const SettingsStackHeader: FC<SettingsStackHeaderProps> = ({ name, goBack }) => {
  return (
    <SettingsRowLayout
      LeftIcon={goBack ? <LeftIcon goBack={goBack} /> : null}
      Text={<MediumText color={COLOUR.SECONDARY}>{t(name)}</MediumText>}
    />
  );
};
