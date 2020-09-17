import React, { useCallback } from 'react';

import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';

import { NAVIGATION } from '~constants';
import { useCallbackOnGainingFocus, useOnMount } from '~hooks';
import {
  AcknowledgeBreachSelector,
  SensorSelector,
  SensorAction,
  BatteryObserverAction,
  DownloadAction,
} from '~features';

import { SensorChartRow } from '~components';
import { AcknowledgeBreachModal } from '~components/modal/AcknowledgeBreachModal';
import { Gradient } from '~layouts';

const stateToProps = state => {
  const sensors = SensorSelector.sensorsList(state);
  const acknowledgingSensorId = AcknowledgeBreachSelector.sensorId(state);

  return { sensors, acknowledgingSensorId };
};

const dispatchToProps = {
  getSensors: SensorAction.fetchAll,
  startPassiveDownloading: DownloadAction.passiveDownloadingStart,
  startBatteryObserving: BatteryObserverAction.start,
  stopBatteryObserving: BatteryObserverAction.stop,
};

export const SensorListScreenComponent = ({
  sensors,
  navigation,
  getSensors,
  startPassiveDownloading,
  startBatteryObserving,
  acknowledgingSensorId,
}) => {
  useOnMount([startPassiveDownloading, startBatteryObserving]);
  useCallbackOnGainingFocus(getSensors);

  const renderItem = useCallback(({ item: { id } }) => {
    const sensorDetailScreen = NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL;
    const onPress = () => navigation.navigate(sensorDetailScreen, { id });
    return <SensorChartRow id={id} onPress={onPress} />;
  }, []);

  return (
    <Gradient>
      <FlatList data={sensors} keyExtractor={item => item.id} renderItem={renderItem} />
      <AcknowledgeBreachModal id={acknowledgingSensorId} />
    </Gradient>
  );
};

export const SensorListScreen = connect(stateToProps, dispatchToProps)(SensorListScreenComponent);
