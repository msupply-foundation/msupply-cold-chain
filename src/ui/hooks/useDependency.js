import { useContext } from 'react';

import { DependencyLocatorContext } from '~services/DependencyLocator';

export const useDependency = service => {
  const depsLocator = useContext(DependencyLocatorContext);
  const dependency = depsLocator.get(service);

  return dependency;
};
