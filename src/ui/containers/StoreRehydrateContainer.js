import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';

import { SensorAction } from '~sensor';
import { SettingAction } from '~setting';
import { BreachConfigurationAction } from '~breachConfiguration';

import { HydrateSelector } from '../../features/hydrate/hydrateSlice';
import { ChartAction } from '../../features/chart';

import { BreachAction } from '../../features/breach';
import { TemperatureDownloadAction } from '../../features/temperatureDownload';
import { BluetoothStateActions } from '../../services/bluetooth';

export const StoreRehydrateContainer = ({ children }) => {
  const dispatch = useDispatch();
  const allReady = useSelector(HydrateSelector.all);

  useEffect(() => {
    (async () => {
      if (allReady) setTimeout(async () => SplashScreen.hideAsync(), 50);
    })();
  }, [allReady]);

  useEffect(() => {
    dispatch(SensorAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(SettingAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(BreachConfigurationAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(ChartAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(BreachAction.getAllCumulativeExposures());
  }, []);

  useEffect(() => {
    dispatch(TemperatureDownloadAction.startPassiveDownloading());
  });

  useEffect(() => {
    dispatch(BluetoothStateActions.startWatchingBatteryLevels());
  });

  return allReady ? children : null;
};
