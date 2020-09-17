import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

// Can create new callbacks, onLosingFocus/onFocus (for both) if/when needed,
// rather than having conditionals all through them.
export const useCallbackOnGainingFocus = callback => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) callback();
  }, [isFocused, callback]);

  return isFocused;
};
