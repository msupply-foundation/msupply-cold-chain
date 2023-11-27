import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppRegistry, NativeModules } from 'react-native';
import { useOnMount } from '~hooks';
import { DownloadAction } from '~features';

export const useForegroundService = (): void => {
  const { Scheduler } = NativeModules;
  const dispatch = useDispatch();
  const [isRunningService, setIsRunningService] = useState(false);

  const startService = async () => {
    if (isRunningService) return;

    const schedulerTask = async () => {
      console.log('===> Receiving HeartBeat!');
      dispatch(DownloadAction.downloadTemperaturesStart());
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
