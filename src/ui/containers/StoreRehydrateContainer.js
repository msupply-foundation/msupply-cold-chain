import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';

import { SensorAction } from '~sensor';
import { SettingAction } from '~setting';

import { HydrateSelector } from '../../features/hydrate/hydrateSlice';

import { BreachAction } from '../../features/breach';

import { DownloadAction } from '../../features/bluetooth/download';

// TODO: Remove this and replace with calls within components on mount
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
    dispatch(BreachAction.getAllCumulativeExposures());
  }, []);

  useEffect(() => {
    dispatch(DownloadAction.passiveDownloadingStart());
  });

  return allReady ? children : null;
};
