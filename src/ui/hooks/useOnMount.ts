import { useEffect } from 'react';

export const useOnMount = (
  funcOrArray: () => void | (() => void)[],
  cleanUpFuncOrArray: () => void | (() => void)[]
): void => {
  let funcToExecute: () => void = funcOrArray;
  if (Array.isArray(funcOrArray)) {
    funcToExecute = () => {
      funcOrArray.forEach(func => func());
    };
  }

  let cleanUpFunc: () => void = cleanUpFuncOrArray;
  if (Array.isArray(cleanUpFuncOrArray)) {
    cleanUpFunc = () => {
      cleanUpFuncOrArray.forEach(func => func());
    };
  }

  useEffect(() => {
    funcToExecute();
    return cleanUpFunc;
  }, []);
};
