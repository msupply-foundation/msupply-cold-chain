import { useState, useCallback } from 'react';

export const useToggle = (initialValue = false): [boolean, () => void] => {
  const [isToggled, setIsToggled] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setIsToggled(state => !state);
  }, [setIsToggled]);

  return [isToggled, toggle];
};
