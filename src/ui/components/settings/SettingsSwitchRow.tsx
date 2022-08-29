import React, { FC } from 'react';
import { Switch } from '../../presentation';
import { SettingsItem } from './SettingsItem';

interface SettingsSwitchRowProps {
  label: string;
  subtext: string;
  onPress: () => void;
  isOn: boolean;
  isDisabled?: boolean;
}

export const SettingsSwitchRow: FC<SettingsSwitchRowProps> = ({
  label,
  subtext,
  onPress,
  isOn,
  isDisabled = false,
}) => {
  const RightComponent = <Switch isOn={isOn} isDisabled={isDisabled} onPress={onPress} />;
  return (
    <SettingsItem
      label={label}
      subtext={subtext}
      RightComponent={RightComponent}
      onPress={onPress}
    />
  );
};
