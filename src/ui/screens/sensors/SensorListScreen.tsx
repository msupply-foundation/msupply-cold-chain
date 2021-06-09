import React, { FC, useCallback, useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { NAVIGATION } from '~constants';
import { useOnMount } from '~hooks';
import {
  AcknowledgeBreachSelector,
  SensorSelector,
  SensorAction,
  BatteryObserverAction,
  DownloadAction,
  SyncAction,
} from '~features';

import { SensorChartRow } from '~components';
import { AcknowledgeBreachModal } from '~components/modal/AcknowledgeBreachModal';
import { Gradient } from '~layouts';
import { RootState } from '~store';
import { HydrateAction } from '~features/Hydrate';

export const SensorListScreen: FC = () => {
  const navigation = useNavigation();
  const sensorIds = useSelector(SensorSelector.sensorIds);

  const acknowledgingSensorId = useSelector((state: RootState) =>
    AcknowledgeBreachSelector.sensorId(state)
  );

  const dispatch = useDispatch();
  const getSensors = () => dispatch(SensorAction.fetchAll());
  const hydrate = () => dispatch(HydrateAction.hydrate());

  const startPassiveDownloading = () => {
    setTimeout(() => {
      dispatch(DownloadAction.passiveDownloadingStart());
    }, 50000);
  };

  const startBatteryObserving = () => {
    setTimeout(() => {
      dispatch(BatteryObserverAction.start());
    }, 50000);
  };

  const startIntegrating = () => {
    setTimeout(() => {
      dispatch(SyncAction.tryStartPassiveIntegration());
    }, 50000);
  };

  useLayoutEffect(() => {
    getSensors();
  }, []);

  useOnMount([hydrate, startPassiveDownloading, startBatteryObserving, startIntegrating]);

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const sensorDetailScreen = NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL;
      const onPress = () => {
        navigation.navigate(sensorDetailScreen, { id: item });
      };
      return <SensorChartRow id={item} onPress={onPress} />;
    },
    [navigation]
  );

  return (
    <Gradient>
      <FlatList data={sensorIds} keyExtractor={item => item} renderItem={renderItem} />
      <AcknowledgeBreachModal id={acknowledgingSensorId} />
    </Gradient>
  );
};
