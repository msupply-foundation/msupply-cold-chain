import React, { useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { SensorChartRow } from '~components';
import { SensorSelector, SensorAction } from '~sensor';

import { Gradient } from '~layouts';
import { NAVIGATION } from '~constants';
import { BreachAction } from '~features/breach';
import { BatteryObserverAction } from '../../../features/bluetooth/batteryObserver';

import { DownloadAction } from '../../../features/bluetooth';

export const SensorListScreen = React.memo(({ navigation }) => {
  const sensors = useSelector(SensorSelector.sensorsList, shallowEqual);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(DownloadAction.passiveDownloadingStart());
  });

  useEffect(() => {
    dispatch(SensorAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(BatteryObserverAction.start());
    return () => dispatch(BatteryObserverAction.stop());
  });

  useEffect(() => {
    dispatch(BreachAction.getAllCumulativeExposures());
  }, []);

  useEffect(() => {
    if (isFocused) navigation.dangerouslyGetParent().setOptions({ tabBarVisible: true });
  }, [isFocused]);

  const renderItem = useCallback(({ item: { id } }) => {
    const onPress = () => {
      navigation.navigate(NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL, { id });
    };
    return <SensorChartRow id={id} onPress={onPress} />;
  }, []);

  return (
    <Gradient>
      <FlatList data={sensors} keyExtractor={item => item.id} renderItem={renderItem} />
    </Gradient>
  );
});
