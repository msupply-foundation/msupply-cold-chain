import { useCallback } from 'react';

interface CallbackWithParams {
  (params?: any[]): void;
}

interface TriggeredCallback {
  (): void;
}

export const useCombinedCallback = (
  fn1: CallbackWithParams,
  fn2: TriggeredCallback,
  deps = []
): CallbackWithParams => {
  const wrappedFn = useCallback(
    (...props: any[]) => {
      fn1(...props);
      fn2();
    },
    [fn1, fn2, ...deps]
  );

  return wrappedFn;
};
