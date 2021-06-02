import { useContext } from 'react';
import { Dependency, DependencyKey } from '~services/DependencyLocator/DependencyLocator';
import { DependencyLocatorContext, FormatService, MigrationService, UtilService } from '~services';
import { DEPENDENCY } from '~constants';

export const useDependency = (service: DependencyKey): Dependency | undefined => {
  const depsLocator = useContext(DependencyLocatorContext);
  const dependency: Dependency | undefined = depsLocator.get(service);

  return dependency;
};

export const useMigrationService = (): MigrationService => {
  const migrationService = useDependency('migrationService');
  return migrationService as MigrationService;
};

export const useFormatter = (): FormatService => {
  const formatter = useDependency('formatService');
  return formatter as FormatService;
};

export const useUtils = (): UtilService => {
  const utils = useDependency('utilService');
  return utils as UtilService;
};
