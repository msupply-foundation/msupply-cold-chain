import { useContext } from 'react';
import { DEPENDENCY } from '../../common/constants';
import { DependencyLocatorContext } from '../../common/services/DependencyLocator';

export const useDependency = (service: DEPENDENCY) => {
  const depsLocator = useContext(DependencyLocatorContext);
  const dependency = depsLocator.get(service);

  return dependency;
};
