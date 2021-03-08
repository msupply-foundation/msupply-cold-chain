import React, { FC } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDatePicker } from '../../hooks';
import { COLOUR } from '../../../common/constants';
import { Chevron } from '../../presentation/icons';
import { SettingsItem } from './SettingsItem';
import { Icon } from '../../presentation/icons/Icon';

interface SettingsDateRowProps {
  label: string;
  subtext: string;
  onChangeDate: (date: Date) => void;
  isDisabled: false;
  initialDate: Date;
}

export const SettingsDateRow: FC<SettingsDateRowProps> = ({
  label = '',
  subtext = '',
  onChangeDate,
  isDisabled = false,
  initialDate = new Date(),
}) => {
  const [isDatePickerOpen, onChange, toggleDatePicker] = useDatePicker(onChangeDate);

  return (
    <>
      <SettingsItem
        label={label}
        subtext={subtext}
        LeftIcon={<Icon.Calendar />}
        RightComponent={<Chevron direction="right" color={COLOUR.GREY_ONE} />}
        onPress={toggleDatePicker}
        isDisabled={isDisabled}
      />
      {isDatePickerOpen && (
        <DateTimePicker value={initialDate} onChange={onChange} mode="time" display="spinner" />
      )}
    </>
  );
};
