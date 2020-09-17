import React, { useCallback } from 'react';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import moment from 'moment';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { COLOUR } from '~constants';

import { Row } from './Row';
import { Centered } from './Centered';
import { LogTableAction, LogTableSelector } from '../../features/LogTable';

const COLUMNS = [
  { header: 'Timestamp', flex: 1, key: 'time', textAlign: 'left' },
  { header: 'Temperature', flex: 1, key: 'temperature', textAlign: 'right' },
  { header: 'Exposure', flex: 1, key: 'isInBreach', textAlign: 'left' },
];

const SensorLogsCell = ({ data, flex, isLast, textAlign, columnKey, breachType }) => {
  if (columnKey === 'isInBreach') {
    return (
      <Centered
        flex={flex}
        style={[!isLast ? { borderRightColor: COLOUR.DIVIDER_TWO, borderRightWidth: 5 } : {}]}
      >
        {(!!data &&
          (breachType === 'cold' ? (
            <FontAwesome name="snowflake-o" size={20} color={COLOUR.PRIMARY} />
          ) : (
            <FontAwesome name="thermometer" size={20} color={COLOUR.DANGER} />
          ))) ||
          null}
      </Centered>
    );
  }

  return (
    <View
      style={[
        { flex },
        !isLast ? { borderRightColor: COLOUR.DIVIDER_TWO, borderRightWidth: 5 } : {},
      ]}
    >
      <Text style={{ margin: 10, flex, color: 'black', textAlign }}>{data}</Text>
    </View>
  );
};

const keyExtractor = item => {
  return item.id;
};

export const SensorLogsRow = React.memo(
  ({ i, isInHotBreach, isInColdBreach, temperature, timestamp }) => {
    const even = i % 2 === 0;

    const time = moment(timestamp * 1000).format('DD/MM/YY HH:mm:ss');

    const rowData = {
      isInBreach: isInColdBreach || isInHotBreach ? 'yes' : '',
      temperature,
      time,
    };

    return (
      <TouchableNativeFeedback onPress={() => {}}>
        <Row
          flex={1}
          justifyContent="space-between"
          style={{ backgroundColor: even ? COLOUR.GREY_TWO : COLOUR.BACKGROUND_TWO }}
        >
          {COLUMNS.map(({ key, flex, textAlign }, ind) => (
            <SensorLogsCell
              key={key}
              columnKey={key}
              flex={flex}
              data={rowData[key]}
              breachType={isInColdBreach ? 'cold' : 'hot'}
              isLast={ind === COLUMNS.length - 1}
              textAlign={textAlign}
            />
          ))}
        </Row>
      </TouchableNativeFeedback>
    );
  }
);

const Header = ({ columns }) => {
  return (
    <Row
      justifyContent="space-between"
      style={{
        backgroundColor: COLOUR.BACKGROUND_TWO,
        borderTopColor: COLOUR.DIVIDER_TWO,
        borderTopWidth: 5,
      }}
    >
      {columns.map((column, ind) => (
        <Row flex={column.flex} justifyContent="center">
          <SensorLogsCell
            data={column.header}
            isLast
            // eslint-disable-next-line react/no-array-index-key
            key={`${ind}${column.key}`}
          />
        </Row>
      ))}
    </Row>
  );
};

export const SensorLogsTable = React.memo(({ id }) => {
  const data = useSelector(LogTableSelector.logData);
  const isLoading = useSelector(LogTableSelector.isLoading);
  const dispatch = useDispatch();

  const renderItem = useCallback(
    ({ item, index }) => {
      const { id: sid, isInHotBreach, isInColdBreach, temperature, timestamp } = item;
      return (
        <SensorLogsRow
          i={index}
          id={sid}
          isInHotBreach={isInHotBreach}
          isInColdBreach={isInColdBreach}
          temperature={temperature}
          timestamp={timestamp}
        />
      );
    },

    []
  );

  const onEndReached = useCallback(
    () =>
      dispatch(
        LogTableAction.getMoreLogs(moment().subtract(3, 'days').unix(), moment().unix(), id)
      ),
    []
  );

  return (
    <FlatList
      style={{ backgroundColor: '#dddddd' }}
      ListEmptyComponent={<ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.25}
      refreshing={isLoading}
      data={data}
      getItemLayout={(_, index) => ({ length: data.length, offset: 50 * index, index })}
      initialNumToRender={5}
      ListHeaderComponent={<Header columns={COLUMNS} sortedBy="endDate" sortedDirection="desc" />}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      maxToRenderPerBatch={20}
      stickyHeaderIndices={[0]}
    />
  );
});
