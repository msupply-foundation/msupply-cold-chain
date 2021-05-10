import React, { FC, useCallback } from 'react';
import { FlatList, View, Text, ActivityIndicator, TextStyle } from 'react-native';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { MaybeTouchableContainer } from '~layouts';
import { COLOUR } from '../../common/constants';

import { Row } from './Row';
import { Centered } from './Centered';
import { LogTableAction, LogTableSelector } from '../../features';
import { Icon, ICON_SIZE } from '../presentation/icons';

const COLUMNS: Column[] = [
  { header: 'Timestamp', flex: 1, key: 'timestamp', textAlign: 'left', sortable: true },
  { header: 'Temperature', flex: 1, key: 'temperature', textAlign: 'right', sortable: true },
  { header: 'Exposure', flex: 1, key: 'isInBreach', textAlign: 'left', sortable: false },
];

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
    const icon =
      breachType === 'cold' ? (
        <Icon.ColdBreach size={ICON_SIZE.S} color={COLOUR.PRIMARY} />
      ) : (
        <Icon.HotBreach size={ICON_SIZE.S} color={COLOUR.DANGER} />
      );

    const iconOrNull = data ? icon : null;

    return (
      <Centered
        flex={flex}
        style={!isLast ? { borderRightColor: COLOUR.DIVIDER_TWO, borderRightWidth: 5 } : {}}
      >
        {iconOrNull}
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
      timestamp: time,
    };

    return (
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
            data={String(rowData[key])}
            breachType={isInColdBreach ? 'cold' : 'hot'}
            isLast={ind === COLUMNS.length - 1}
            textAlign={textAlign}
          />
        ))}
      </Row>
    );
  }
);

interface Column extends Pick<TextStyle, 'textAlign'> {
  header: string;
  flex: number;
  key: 'timestamp' | 'temperature' | 'isInBreach';
  sortable: boolean;
}

interface HeaderProps {
  columns: Column[];
}

const Header = ({ columns }: HeaderProps) => {
  const { sortKey, sortDirection } = useSelector(LogTableSelector.sortConfig);
  const dispatch = useDispatch();

  return (
    <Row
      justifyContent="space-between"
      style={{
        backgroundColor: COLOUR.BACKGROUND_TWO,
        borderTopColor: COLOUR.DIVIDER_TWO,
        borderTopWidth: 5,
      }}
    >
      {columns.map(column => {
        const { key, sortable, header, flex, textAlign } = column;

        return (
          <MaybeTouchableContainer
            isDisabled={!sortable}
            style={{ flex }}
            onPress={() => dispatch(LogTableAction.trySortData(key))}
          >
            <Row
              flex={flex}
              justifyContent="center"
              alignItems="center"
              style={{ marginRight: 10 }}
            >
              <SensorLogsCell data={header} isLast key={key} textAlign={textAlign} flex={flex} />
              {sortable ? (
                <Icon.Sort isSorted={sortKey === key} isAsc={sortDirection === 'asc'} />
              ) : null}
            </Row>
          </MaybeTouchableContainer>
        );
      })}
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

  const onEndReached = useCallback(() => {
    dispatch(LogTableAction.fetchMore(moment().subtract(3, 'days').unix(), moment().unix(), id));
  }, [dispatch, id]);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#dddddd' }}
      ListEmptyComponent={
        <ActivityIndicator size="large" color={COLOUR.PRIMARY} style={{ flex: 1 }} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.25}
      refreshing={isLoading}
      data={data}
      getItemLayout={(_, index) => ({ length: data.length, offset: 50 * index, index })}
      ListHeaderComponent={<Header columns={COLUMNS} />}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      stickyHeaderIndices={[0]}
    />
  );
});
