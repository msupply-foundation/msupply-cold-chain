import React, { FC, useCallback, useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { MILLISECONDS, NAVIGATION } from '~constants';
import { SensorAction, SensorSelector } from '~features';
import { HydrateAction } from '~features/Hydrate';
import { SensorChartRow } from '~components';
import { AcknowledgeBreachModal } from '~components/modal/AcknowledgeBreachModal';
import { Gradient } from '~layouts';
import { useForegroundService, useOnMount } from '~hooks';
import moment from 'moment';

export const SensorListScreen: FC = () => {
  const navigation = useNavigation();
  const sensorIds = useSelector(SensorSelector.sensorIds);
  const dispatch = useDispatch();
  const hydrate = () => dispatch(HydrateAction.hydrate());
  const [endTime, setEndTime] = React.useState(moment().unix());

  useForegroundService();

  useLayoutEffect(() => {
    // set a timer to update the endTime every minute
    // this redraws the chart, so that the end time displayed
    // is within a minute of the current time
    const timer = setInterval(() => {
      setEndTime(moment().unix());
    }, MILLISECONDS.ONE_MINUTE);
    // remove the timer when the component unmounts
    return () => {
      clearInterval(timer);
    };
  }, [dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const sensorDetailScreen = NAVIGATION.SCREENS.SENSOR_STACK.SENSOR_DETAIL;
      const onPress = () => {
        navigation.navigate(sensorDetailScreen, { id: item });
      };
      return <SensorChartRow id={item} onPress={onPress} endTime={endTime} />;
    },
    [navigation, endTime]
  );
  useLayoutEffect(() => {
    dispatch(SensorAction.fetchAll());
  }, [dispatch]);

  useOnMount([hydrate]);

  return (
    <Gradient>
      <FlatList data={sensorIds} keyExtractor={item => item} renderItem={renderItem} />
      <AcknowledgeBreachModal />
    </Gradient>
  );
};
