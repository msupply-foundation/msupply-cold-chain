import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppRegistry } from 'react-native';
// import { AppRegistry, Platform } from 'react-native';

// import VIForegroundService from '@voximplant/react-native-foreground-service';

import { useOnMount } from '~hooks';
import { DownloadAction } from '~features';
// import { BatteryObserverAction, DownloadAction, SyncAction } from '~features';
// import { getApplicationName } from 'react-native-device-info';
import { NativeModules } from 'react-native';

export const useForegroundService = (): void => {
  const { Scheduler } = NativeModules;
  const dispatch = useDispatch();
  // const foregroundService = VIForegroundService.getInstance();
  const [isRunningService, setIsRunningService] = useState(false);

  // const startActions = new Promise(() => {
  //   // setTimeout(() => {
  //   console.log('===> START ACTIONS');
  //   dispatch(DownloadAction.passiveDownloadingStart());
  //   dispatch(BatteryObserverAction.start());
  //   dispatch(SyncAction.tryStartPassiveIntegration());
  //   // keep the promise alive
  //   // }, 1000); // 50000);
  //   // while (true) {}
  // }).catch(e => {
  //   console.error(`===> Unable to start monitoring actions: ${e.message}`);
  // });

  const startService = async () => {
    // const platformVersion = Number(Platform.Version);
    // if (Platform.OS !== 'android') {
    //   console.log('Only Android platform is supported');
    //   return;
    // }

    if (isRunningService) return;

    // if (!Number.isNaN(platformVersion) && platformVersion >= 26) {
    //   const channelConfig = {
    //     id: getApplicationName(),
    //     name: 'mSupply ColdChain Notification Channel',
    //     description: 'Notification Channel for mSupply ColdChain Foreground Service',
    //     enableVibration: false,
    //     importance: 2,
    //   };
    //   await foregroundService.createNotificationChannel(channelConfig);
    // }

    // const notificationConfig = {
    //   channelId: getApplicationName(),
    //   id: 3456,
    //   title: 'mSupply ColdChain Service',
    //   text: 'mSupply ColdChain service is running',
    //   icon: 'ic_notification',
    //   priority: 0,
    //   button: 'Stop service',
    // };

    const MyHeadlessTask = async () => {
      console.log('===> Receiving HeartBeat!');
      dispatch(DownloadAction.downloadTemperaturesStart());
    };

    try {
      console.log('===> REGISTERING HEADLESS TASK');
      AppRegistry.registerHeadlessTask('ColdchainScheduler', () => MyHeadlessTask);

      console.log('===> STARTING SERVICE');
      await Scheduler.startService();
      // subscribeForegroundButtonPressedEvent();
      // foregroundService.add;
      // await foregroundService.startService(notificationConfig, startActions);
      setIsRunningService(true);
    } catch (e) {
      // foregroundService.off();
      console.log(`===> Error ${(e as Error).message}`);
    }
  };

  // const stopService = async () => {
  //   if (!isRunningService) return;
  //   setIsRunningService(false);
  //   await foregroundService.stopService();
  //   foregroundService.off();
  // };

  // const subscribeForegroundButtonPressedEvent = () => {
  //   foregroundService.on('VIForegroundServiceButtonPressed', async () => {
  //     await stopService();
  //   });
  // };

  useOnMount([startService]);
};
