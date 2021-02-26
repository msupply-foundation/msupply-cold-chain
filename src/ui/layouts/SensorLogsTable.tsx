import React, { FC, useCallback } from 'react';
import { FlatList, View, Text, ActivityIndicator, TextStyle } from 'react-native';
import moment from 'moment';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';

import { COLOUR } from '../../common/constants';

import { Row } from './Row';
import { Centered } from './Centered';
import { LogTableAction, LogTableSelector } from '../../features';
import { Icon, ICON_SIZE } from '../presentation/icons';

const COLUMNS: Column[] = [
  { header: 'Timestamp', flex: 1, key: 'time', textAlign: 'left' },
  { header: 'Temperature', flex: 1, key: 'temperature', textAlign: 'right' },
  { header: 'Exposure', flex: 1, key: 'isInBreach', textAlign: 'left' },
];

type X = Pick<TextStyle, 'textAlign'>;

interface SensorLogsCellProps extends Pick<TextStyle, 'textAlign'> {
  data: string;
  flex?: number;
  isLast?: boolean;
  columnKey?: string;
  breachType?: string;
}

const SensorLogsCell: FC<SensorLogsCellProps> = ({
  data,
  flex,
  isLast,
  textAlign,
  columnKey,
  breachType,
}) => {
  if (columnKey === 'isInBreach') {
    return (
      <Centered
        flex={flex}
        style={[!isLast ? { borderRightColor: COLOUR.DIVIDER_TWO, borderRightWidth: 5 } : {}]}
      >
        {(!!data &&
          (breachType === 'cold' ? (
            <Icon.ColdBreach size={ICON_SIZE.S} color={COLOUR.PRIMARY} />
          ) : (
            <Icon.HotBreach size={ICON_SIZE.S} color={COLOUR.DANGER} />
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

const keyExtractor = (item: { id: string }) => {
  return item.id;
};

interface SensorLogsRowProps {
  i: number;
  isInHotBreach: boolean;
  isInColdBreach: boolean;
  temperature: number;
  timestamp: number;
}

export const SensorLogsRow: FC<SensorLogsRowProps> = React.memo(
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

interface Column extends Pick<TextStyle, 'textAlign'> {
  header: string;
  flex: number;
  key: string;
}

interface HeaderProps {
  columns: Column[];
}

const Header = ({ columns }: HeaderProps) => {
  return (
    <Row
      justifyContent="space-between"
      style={{
        backgroundColor: COLOUR.BACKGROUND_TWO,
        borderTopColor: COLOUR.DIVIDER_TWO,
        borderTopWidth: 5,
      }}
    >
      {columns.map(column => (
        <Row flex={column.flex} justifyContent="center">
          <SensorLogsCell data={column.header} isLast key={column.key} />
        </Row>
      ))}
    </Row>
  );
};

interface SensorLogsTableProps {
  id: string;
}

export const SensorLogsTable: FC<SensorLogsTableProps> = React.memo(({ id }) => {
  const data = useSelector(LogTableSelector.data);
  const isLoading = useSelector(LogTableSelector.isLoading);
  const dispatch = useDispatch();

  const renderItem = useCallback(
    ({ item, index }) => {
      const { isInHotBreach, isInColdBreach, temperature, timestamp } = item;
      return (
        <SensorLogsRow
          i={index}
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
      dispatch(LogTableAction.fetchMore(moment().subtract(3, 'days').unix(), moment().unix(), id)),
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
      ListHeaderComponent={<Header columns={COLUMNS} />}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      maxToRenderPerBatch={20}
      stickyHeaderIndices={[0]}
    />
  );
});
