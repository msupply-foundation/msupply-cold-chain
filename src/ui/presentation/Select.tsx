import React, { FC } from 'react';
import { Picker } from '@react-native-picker/picker';

export interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  isDisabled?: boolean;
  options: Option[];
  selectedValue?: string;
  onChange: (value: string, index: number) => void;
}

export const Select: FC<SelectProps> = ({
  onChange,
  options,
  isDisabled = false,
  selectedValue,
}) => (
  <Picker enabled={!isDisabled} onValueChange={onChange} selectedValue={selectedValue}>
    {options.map(({ label, value }) => (
      <Picker.Item key={value} label={label} value={value} />
    ))}
  </Picker>
);
