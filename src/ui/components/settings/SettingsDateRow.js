import DateTimePicker from '@react-native-community/datetimepicker';

import { useDatePicker } from '~hooks';
import { COLOUR } from '~constants';

import { Chevron, Calendar } from '~presentation/icons';

import { SettingsItem } from './SettingsItem';

export const SettingsDateRow = ({
  label = '',
  subtext = '',
  onChangeDate = null,
  isDisabled = false,
  initialDate = new Date(),
}) => {
  const [isDatePickerOpen, onChange, toggleDatePicker] = useDatePicker(onChangeDate);

  return (
    <>
      <SettingsItem
        label={label}
        subtext={subtext}
        LeftIcon={<Calendar />}
        RightComponent={<Chevron direction="right" colour={COLOUR.GREY_ONE} />}
        onPress={toggleDatePicker}
        isDisabled={isDisabled}
      />
      {isDatePickerOpen && (
        <DateTimePicker value={initialDate} onChange={onChange} mode="time" display="spinner" />
      )}
    </>
  );
};
