import React, { FC, ReactNode } from 'react';
import { Icon as AppIcon } from '../../presentation/icons';
import { SettingsItem } from './SettingsItem';
import { COLOUR } from '../../../common/constants';

interface SettingsNavigationRowProps {
  label: string;
  subtext?: string;
  Icon: ReactNode;
  onPress: () => void;
}

export const SettingsNavigationRow: FC<SettingsNavigationRowProps> = ({
  label,
  subtext,
  Icon,
  onPress,
}) => {
  return (
    <SettingsItem
      LeftIcon={Icon}
      label={label}
      subtext={subtext}
      RightComponent={<AppIcon.Chevron color={COLOUR.GREY_ONE} direction="right" />}
      onPress={onPress}
    />
  );
};
