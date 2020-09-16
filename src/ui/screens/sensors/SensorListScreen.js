import React, { useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { SensorChartRow } from '~components';
import { SensorSelector } from '~sensor';

import { Gradient } from '~layouts';
import { NAVIGATION } from '~constants';
import { BreachAction } from '~features/breach';
import { BatteryObserverAction } from '../../../features/bluetooth/batteryObserver';
import { HandleBreachModal } from '../../components/HandleBreachModal';

export const SensorListScreen = React.memo(({ navigation }) => {
  const sensors = useSelector(SensorSelector.sensorsList, shallowEqual);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

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
    return (
      <>
        <SensorChartRow id={id} onPress={onPress} />
        <HandleBreachModal id={id} />
      </>
    );
  }, []);

  return (
    <Gradient>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={sensors}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </Gradient>
  );
});
