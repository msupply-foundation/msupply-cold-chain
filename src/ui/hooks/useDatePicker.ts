import { useState, useCallback } from 'react';

interface OnChangeDateCallback {
  (date: Date): void;
}

export const useDatePicker = (onChangeDate: OnChangeDateCallback) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const onChange = useCallback(
    ({ nativeEvent: { timestamp } }) => {
      setIsDatePickerOpen(false);
      if (timestamp) onChangeDate(new Date(timestamp));
    },
    [onChangeDate, setIsDatePickerOpen]
  );

  const toggleDatePicker = useCallback(() => {
    setIsDatePickerOpen(state => !state);
  }, []);

  return [isDatePickerOpen, onChange, toggleDatePicker];
};
