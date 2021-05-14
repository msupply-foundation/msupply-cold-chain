import React, { FC, useEffect } from 'react';
import { useToggle } from '~hooks';
import { useMigrationService } from '~hooks/useDependency';
import { FatalError } from '~components/modal/FatalError';
import { t } from '~common/translations';

const useMigrations = () => {
  const [load, setLoad] = useToggle(false);
  const [error, setError] = useToggle(false);
  const migrationService = useMigrationService();

  useEffect(() => {
    const doMigrations = async () => {
      const result = await migrationService.start();

      if (result) {
        setLoad();
      } else {
        setError();
      }
    };

    doMigrations();
  }, [migrationService, setLoad, setError]);

  return [load, error];
};

// TODO: User feedback for migrating if it ever gets to a point where it takes more than a second.
// Could also hide the splash here instead
export const MigrationRunner: FC = ({ children }) => {
  const [success, error] = useMigrations();

  if (error) {
    return <FatalError errorMessage={t('MIGRATION_ERROR')} />;
  }
  return success ? <>{children}</> : null;
};
