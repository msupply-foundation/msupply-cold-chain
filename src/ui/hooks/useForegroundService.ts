import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppRegistry, NativeModules } from 'react-native';
import { useOnMount } from '~hooks';
import { DownloadAction, SettingSelector, SyncAction } from '~features';
import Bugsnag from '@bugsnag/react-native';
import { MILLISECONDS } from '~constants';

export const useForegroundService = (): void => {
  const { Scheduler } = NativeModules;
  const dispatch = useDispatch();
  const [isRunningService, setIsRunningService] = useState(false);
  const { serverUrl } = useSelector(SettingSelector.getSettings);

  const startService = async () => {
    if (isRunningService) return;

    // Send the sync url to bugsnag so we have more context for where an error is occurring
    Bugsnag.addMetadata('sync', 'serverUrl', serverUrl);
    setTimeout(() => Scheduler.updateStatus('Running...'), MILLISECONDS.THIRTY_SECONDS);

    const schedulerTask = async () => {
      dispatch(DownloadAction.downloadTemperaturesStart());
      dispatch(SyncAction.tryIntegrating());
    };

    try {
      // this task is called by the SchedulerEventService on a regular interval
      AppRegistry.registerHeadlessTask('ColdchainScheduler', () => schedulerTask);
      // start the foreground service
      await Scheduler.startService();
      setIsRunningService(true);
    } catch (e) {
      console.error(`Error starting scheduler service: ${(e as Error).message}`);
    }
  };

  useOnMount([startService]);
};
