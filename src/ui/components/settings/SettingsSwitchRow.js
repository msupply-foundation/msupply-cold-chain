import { Switch } from '~presentation';
import { SettingsItem } from './SettingsItem';

export const SettingsSwitchRow = ({ label, subtext, onPress, isOn, isDisabled }) => {
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
