import React, { FC } from 'react';
import { SettingsItem } from './SettingsItem';

interface SettingsButtonRowProps {
  label: string;
  subtext: string;
  onPress: () => void;
}

export const SettingsButtonRow: FC<SettingsButtonRowProps> = ({ label, subtext, onPress }) => {
  return <SettingsItem label={label} subtext={subtext} onPress={onPress} />;
};
