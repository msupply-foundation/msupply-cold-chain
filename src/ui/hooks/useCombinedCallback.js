import { useCallback } from 'react';

export const useCombinedCallback = (fn1, fn2, deps = []) => {
  const wrappedFn = useCallback(
    (...props) => {
      fn1(...props);
      fn2();
    },
    [fn1, fn2, ...deps]
  );

  return wrappedFn;
};
