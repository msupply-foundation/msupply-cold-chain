import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppRegistry, NativeModules } from 'react-native';
import { useFormatter, useOnMount } from '~hooks';
import { DownloadAction, SettingSelector, SyncAction, SyncSelector } from '~features';
import Bugsnag from '@bugsnag/react-native';

export const useForegroundService = (): void => {
  const { Scheduler } = NativeModules;
  const dispatch = useDispatch();
  const [isRunningService, setIsRunningService] = useState(false);
  const formatter = useFormatter();
  const { isIntegrating, lastSync, lastSyncStart, serverUrl } = useSelector(
    SettingSelector.getSettings
  );
  const isSyncing = useSelector(SyncSelector.getIsSyncing);

  const syncStatus = () => {
    if (!isIntegrating) {
      return 'Disabled';
    }
    if (isSyncing) {
      return `Syncing in progress. Started ${formatter.dateTime(lastSyncStart)}`;
    }
    return `Idle. Last successful sync finished ${formatter.dateTime(lastSync)}`;
  };

  const startService = async () => {
    if (isRunningService) return;

    // Send the sync url to bugsnag so we have more context for where an error is occurring
    Bugsnag.addMetadata('sync', 'serverUrl', serverUrl);

    const schedulerTask = async () => {
      const status = `Running.. Integration ${syncStatus()}`;
      Scheduler.updateStatus(status);
      dispatch(DownloadAction.downloadTemperaturesStart());
      dispatch(SyncAction.tryIntegrating());
    };

    try {
      AppRegistry.registerHeadlessTask('ColdchainScheduler', () => schedulerTask);
      await Scheduler.startService();
      setIsRunningService(true);
    } catch (e) {
      console.error(`Error starting scheduler service: ${(e as Error).message}`);
    }
  };

  useOnMount([startService]);
};
