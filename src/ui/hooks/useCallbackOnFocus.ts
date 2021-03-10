import { useCallback, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

interface TriggeredCallback {
  (): void;
}

// Can create new callbacks, onLosingFocus/onFocus (for both) if/when needed,
// rather than having conditionals all through them.
export const useCallbackOnGainingFocus = (callback: TriggeredCallback): boolean => {
  const isFocused = useIsFocused();

  const memoized = useCallback(callback, []);

  useEffect(() => {
    if (isFocused) memoized();
  }, [isFocused, memoized]);

  return isFocused;
};
