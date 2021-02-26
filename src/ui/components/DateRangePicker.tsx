import React, { FC, useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

import { t } from '../../common/translations';
import { Button } from './buttons';
import { Centered, FullScreenModal, Row } from '../layouts';
import { COLOUR } from '../../common/constants';
import { LoadAfterInteractions } from './LoadAfterInteractions';

// TODO: Fix types
const rangeToMarked = (range: any) => {
  return range
    .toArray('days')
    .map((date: any) => date.format('YYYY-MM-DD'))
    .reduce(
      (acc: any, value: any, index: number, source: any) => ({
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

interface DateRangePickerProps {
  initialStart: number;
  initialEnd: number;
  onConfirm: (start: number, end: number) => void;
  onCancel: () => void;
  maximumDate: number;
  minimumDate: number;
  isOpen: boolean;
}

export const DateRangePicker: FC<DateRangePickerProps> = ({
  initialStart,
  initialEnd,
  onConfirm,
  onCancel,
  maximumDate,
  minimumDate,
  isOpen,
}) => {
  const [range, setRange] = useState((moment(initialStart) as any).twix(initialEnd));
  const onDayPress = useCallback(
    ({ dateString, timestamp }) => {
      if (range.contains(timestamp)) {
        const newRange = (moment(timestamp) as any).twix(dateString);
        setRange(newRange);
      } else if (moment(timestamp).isAfter(range.end())) {
        const newRange = range.union((moment(timestamp) as any).twix(timestamp));
        setRange(newRange);
      } else {
        const newRange = (moment(timestamp) as any).twix(timestamp);
        setRange(newRange);
      }
    },
    [range]
  );

  const Loading = (
    <Centered style={{ height: 300, backgroundColor: 'white' }}>
      <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
    </Centered>
  );
  return (
    <FullScreenModal isOpen={isOpen} animationIn="bounceIn" animationOut="bounceOut">
      <View style={{ width: '100%' }}>
        <LoadAfterInteractions Loading={Loading}>
          <Calendar
            current={range.start().format('YYYY-MM-DD')}
            markingType="period"
            onDayPress={onDayPress}
            enableSwipeMonths
            markedDates={rangeToMarked(range)}
            minDate={moment(minimumDate).format('YYYY-MM-DD')}
            maxDate={moment(maximumDate).format('YYYY-MM-DD')}
          />
        </LoadAfterInteractions>
        <Row
          justifyContent="flex-end"
          style={{ backgroundColor: COLOUR.WHITE, paddingVertical: 50 }}
        >
          <Button
            variant="dark"
            text={t('OK')}
            onPress={() =>
              onConfirm(range.start().unix() as number, range.end().endOf('day').unix() as number)
            }
          />
          <Button variant="dark" text={t('CANCEL')} onPress={onCancel} />
        </Row>
      </View>
    </FullScreenModal>
  );
};
