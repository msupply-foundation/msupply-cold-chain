import { useState, useCallback } from 'react';

export const useDatePicker = onChangeDate => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const onChange = useCallback(
    date => {
      if (date) onChangeDate(date);
      setIsDatePickerOpen(false);
    },
    [onChangeDate, setIsDatePickerOpen]
  );

  const toggleDatePicker = useCallback(() => {
    setIsDatePickerOpen(state => !state);
  }, []);

  return [isDatePickerOpen, onChange, toggleDatePicker];
};
