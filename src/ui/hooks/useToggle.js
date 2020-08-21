import { useState, useCallback } from 'react';

export const useToggle = (initialValue = false) => {
  const [isToggled, setIsToggled] = useState(initialValue);

  const toggle = useCallback(() => {
    setIsToggled(state => !state);
  }, [setIsToggled]);

  return [isToggled, toggle];
};
