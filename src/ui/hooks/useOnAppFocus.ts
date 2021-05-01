import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';

export const useOnAppFocus = (callback: () => void): void => {
  const currentStateRef = useRef(AppState.currentState);

  const memoized = useCallback(
    async nextState => {
      const { currentState } = AppState;
      const isNotInFocus = currentState.match(/background|inactive/);
      const isComingIntoFocus = nextState === 'active';

      if (isNotInFocus && isComingIntoFocus) {
        await callback();
      }

      currentStateRef.current = AppState.currentState;
    },
    [callback]
  );

  useEffect(() => {
    AppState.addEventListener('focus', memoized);
    return () => AppState.removeEventListener('focus', memoized);
  }, [memoized]);
};
