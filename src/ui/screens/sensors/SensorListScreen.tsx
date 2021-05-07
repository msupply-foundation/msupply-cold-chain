import React, { FC, useCallback } from 'react';
import { useNavigation } from '@react-navigation/core';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { NAVIGATION } from '~constants';
import { useCallbackOnGainingFocus, useOnMount } from '~hooks';
import {
  AcknowledgeBreachSelector,
  SensorSelector,
  SensorAction,
  BatteryObserverAction,
  DownloadAction,
  SyncAction,
} from '~features';

import { SensorChartRow } from '~components';
import { AcknowledgeBreachModal } from '../../components/modal/AcknowledgeBreachModal';
import { Gradient } from '~layouts';
import { RootState } from '~store/store';

export const SensorListScreen: FC = () => {
  const navigation = useNavigation();
  const sensors = useSelector((state: RootState) => SensorSelector.sensorsList(state));
  const acknowledgingSensorId = useSelector((state: RootState) =>
    AcknowledgeBreachSelector.sensorId(state)
  );

  const dispatch = useDispatch();
  const getSensors = () => dispatch(SensorAction.fetchAll());

  const startPassiveDownloading = () => {
    dispatch(DownloadAction.passiveDownloadingStart());
  };

  const startBatteryObserving = () => {
    dispatch(BatteryObserverAction.start());
  };

  const startIntegrating = () => {
    dispatch(SyncAction.tryStartPassiveIntegration());
  };

  useOnMount([startPassiveDownloading, startBatteryObserving, startIntegrating]);
  useCallbackOnGainingFocus(getSensors);

  // TODO: Typings??
  const renderItem = useCallback(
    ({ item: { id } }: { item: { id: string } }) => {
      const sensorDetailScreen = NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL;
      const onPress = () => {
        navigation.navigate(sensorDetailScreen, { id });
      };
      return <SensorChartRow id={id} onPress={onPress} />;
    },
    [navigation]
  );

  return (
    <Gradient>
      <FlatList data={sensors} keyExtractor={item => item.id} renderItem={renderItem} />
      <AcknowledgeBreachModal id={acknowledgingSensorId} />
    </Gradient>
  );
};
