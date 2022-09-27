import { useContext } from 'react';
import { BtUtilService } from 'msupply-ble-service';
import { Dependency, DependencyKey } from '~services/DependencyLocator/DependencyLocator';
import {
  DatabaseService,
  DependencyLocatorContext,
  FormatService,
  MigrationService,
  UtilService,
} from '~services';

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

export const useBtUtils = (): BtUtilService => {
  const btUtils = useDependency('btUtilService');
  return btUtils as BtUtilService;
};

export const useDb = (): DatabaseService => {
  const dbService = useDependency('database');

  return dbService as DatabaseService;
};
