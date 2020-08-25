import { SettingsItem } from './SettingsItem';

export const SettingsButtonRow = ({ label, subtext, onPress }) => {
  return <SettingsItem label={label} subtext={subtext} onPress={onPress} />;
};
