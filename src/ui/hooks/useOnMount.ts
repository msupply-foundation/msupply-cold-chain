import { useEffect } from 'react';

export const useOnMount = (
  funcOrArray: (() => void) | (() => void)[],
  cleanUpFuncOrArray?: () => void | (() => void)[]
): void => {
  let funcToExecute: () => void;
  if (Array.isArray(funcOrArray)) {
    funcToExecute = () => {
      funcOrArray.forEach(func => func());
    };
  } else {
    funcToExecute = funcOrArray;
  }

  let cleanUpFunc: (() => void) | undefined = cleanUpFuncOrArray;
  if (Array.isArray(cleanUpFuncOrArray)) {
    cleanUpFunc = () => {
      cleanUpFuncOrArray.forEach(func => func());
    };
  }

  useEffect(() => {
    funcToExecute();
    return cleanUpFunc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
