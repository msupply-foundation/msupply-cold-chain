import { useEffect } from 'react';

export const useOnMount = (funcOrArray, cleanUpFuncOrArray) => {
  let funcToExecute = funcOrArray;
  if (Array.isArray(funcOrArray)) {
    funcToExecute = () => {
      funcOrArray.forEach(func => func());
    };
  }

  let cleanUpFunc = cleanUpFuncOrArray;
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
