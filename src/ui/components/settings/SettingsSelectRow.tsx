import React, { FC } from 'react';
import { View } from 'react-native';
import { Select, Option } from '../../presentation';
import { SettingsItem } from './SettingsItem';

interface SettingsSelectRowProps {
  isDisabled?: boolean;
  label: string;
  options: Option[];
  subtext?: string;
  value?: string;
  onChange: (value: string, index: number) => void;
}

export const SettingsSelectRow: FC<SettingsSelectRowProps> = ({
  isDisabled = false,
  label,
  subtext = '',
  options,
  value,
  onChange,
}) => {
  const RightComponent = (
    <View style={{ display: 'flex', flex: 1 }}>
      <Select isDisabled={isDisabled} options={options} selectedValue={value} onChange={onChange} />
    </View>
  );

  return <SettingsItem label={label} subtext={subtext} RightComponent={RightComponent} />;
};
