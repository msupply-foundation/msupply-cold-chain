import { useState, useCallback } from 'react';
import { AndroidEvent, Event as E } from '@react-native-community/datetimepicker';

interface OnChangeDateCallback {
  (date: Date): void;
}

export const useDatePicker = (
  onChangeDate: OnChangeDateCallback
): [
  isDatePickerOpen: boolean,
  onChange: (event: AndroidEvent | E, date?: Date) => void,
  toggleDatePicker: () => void
] => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const onChange = useCallback(
    (event: AndroidEvent | E) => {
      const { nativeEvent = { timestamp: 0 } } = event;

      if ((nativeEvent as { timestamp: number })?.timestamp) {
        const { timestamp } = nativeEvent as { timestamp: number };
        if (timestamp) onChangeDate(new Date(timestamp));
      }

      setIsDatePickerOpen(false);
    },
    [onChangeDate, setIsDatePickerOpen]
  );

  const toggleDatePicker = useCallback(() => {
    setIsDatePickerOpen(state => !state);
  }, []);

  return [isDatePickerOpen, onChange, toggleDatePicker];
};
