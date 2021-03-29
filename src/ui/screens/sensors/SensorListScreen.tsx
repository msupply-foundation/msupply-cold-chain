import React, { FC, useCallback } from 'react';
import { useNavigation } from '@react-navigation/core';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { NAVIGATION } from '../../../common/constants';
import { useCallbackOnGainingFocus, useOnMount } from '../../hooks';
import {
  AcknowledgeBreachSelector,
  SensorSelector,
  SensorAction,
  BatteryObserverAction,
  DownloadAction,
} from '../../../features';

import { SensorChartRow } from '../../components';
import { AcknowledgeBreachModal } from '../../components/modal/AcknowledgeBreachModal';
import { Gradient } from '../../layouts';
import { RootState } from '../../../common/store/store';
import { SensorState } from '../../../features/Entities/Sensor/SensorSlice';

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

  useOnMount([startPassiveDownloading, startBatteryObserving]);
  useCallbackOnGainingFocus(getSensors);

  // TODO: Typings??
  // eslint-disable-next-line react/no-unused-prop-types
  const renderItem = useCallback(({ item: { id } }: { item: { id: string } }) => {
    const sensorDetailScreen = NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL;
    const onPress = () => {
      console.log('id', id);
      navigation.navigate(sensorDetailScreen, { id });
    };
    return <SensorChartRow id={id} onPress={onPress} />;
  }, []);

  return (
    <Gradient>
      <FlatList data={sensors} keyExtractor={item => item.id} renderItem={renderItem} />
      <AcknowledgeBreachModal id={acknowledgingSensorId} />
    </Gradient>
  );
};
