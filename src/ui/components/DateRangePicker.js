import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

import { t } from '~translations';
import { Button } from './buttons';
import { Row } from '~layouts';
import { COLOUR } from '~constants';

const rangeToMarked = range => {
  return range
    .toArray('days')
    .map(date => date.format('YYYY-MM-DD'))
    .reduce(
      (acc, value, index, source) => ({
        ...acc,
        [value]: {
          selected: true,
          startingDay: index === 0,
          endingDay: source.length - 1 === index,
          color: COLOUR.PRIMARY,
        },
      }),
      {}
    );
};

const getToAndFrom = range => {
  const asArray = range.toArray('days');
  const from = asArray[0].toDate();
  const to = asArray[asArray.length - 1].endOf('day').toDate();

  return [from, to];
};

export const DateRangePicker = ({
  initialStart,
  initialEnd,
  onConfirm,
  onCancel,
  maximumDate,
  minimumDate,
}) => {
  const [range, setRange] = useState(moment(initialStart).twix(initialEnd));
  // const

  const onDayPress = useCallback(
    ({ dateString, timestamp }) => {
      if (range.contains(timestamp)) {
        const newRange = moment(timestamp).twix(dateString);
        setRange(newRange);
      } else if (moment(timestamp).isAfter(range.end())) {
        const newRange = range.union(moment(timestamp).twix(timestamp));
        setRange(newRange);
      } else {
        const newRange = moment(timestamp).twix(timestamp);
        setRange(newRange);
      }
    },
    [range]
  );

  return (
    <View>
      <Calendar
        current={range.start().format('YYYY-MM-DD')}
        markingType="period"
        onDayPress={onDayPress}
        enableSwipeMonths
        markedDates={rangeToMarked(range)}
        minDate={minimumDate.format('YYYY-MM-DD')}
        maxDate={maximumDate.format('YYYY-MM-DD')}
      />
      <Row justifyContent="flex-end" style={{ backgroundColor: COLOUR.WHITE, paddingVertical: 50 }}>
        <Button variant="dark" text={t('OK')} onPress={() => onConfirm(...getToAndFrom(range))} />
        <Button variant="dark" text={t('CANCEL')} onPress={onCancel} />
      </Row>
    </View>
  );
};
