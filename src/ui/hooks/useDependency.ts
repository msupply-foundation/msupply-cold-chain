import { useContext } from 'react';
import { DEPENDENCY } from '../../common/constants';
import { DependencyLocatorContext } from '../../common/services/DependencyLocator';
import { Dependencies } from '../../common/services/DependencyLocator/DependencyLocator';

export const useDependency = (service: DEPENDENCY): Dependencies[keyof Dependencies] => {
  const depsLocator = useContext(DependencyLocatorContext);
  const dependency = depsLocator.get(service);

  return dependency;
};
