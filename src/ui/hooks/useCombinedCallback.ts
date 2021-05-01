import { useCallback } from 'react';

// TODO: Better typing
export interface CallbackWithParams {
  (...args: any[]): void;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn1, fn2, ...deps]
  );

  return wrappedFn;
};
