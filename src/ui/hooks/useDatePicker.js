import { useState, useCallback } from 'react';

export const useDatePicker = onChangeDate => {
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
