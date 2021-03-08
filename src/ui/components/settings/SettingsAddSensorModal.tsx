/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useCallback, FC } from 'react';
import { useSelector } from 'react-redux';
import { Pressable, ActivityIndicator } from 'react-native';
import moment from 'moment';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useDatePicker } from '../../hooks';
import { FORMAT, COLOUR, STYLE } from '../../../common/constants';
import { t } from '../../../common/translations';
import { Column, Row } from '../../layouts';
import { NormalText } from '../../presentation/typography';
import { Button } from '../buttons';

import { SettingsEditModal } from './SettingsEditModal';
import { BlinkSelector } from '../../../features/Bluetooth';
import { Icon } from '../../presentation/icons';

const styles = {
  column: { maxHeight: STYLE.HEIGHT.SENSOR_ROW },
  loggingColumns: {
    one: { width: '40%' },
    two: { width: '25%' },
    three: { width: '15%' },
  },
};

interface SettingsAddSensorModalProps {
  macAddress: string;
  onClose(): void;
  isOpen: boolean;
  onConfirm(date: Date): void;
  onBlink(): void;
}

export const SettingsAddSensorModal: FC<SettingsAddSensorModalProps> = ({
  macAddress,
  onClose,
  isOpen,
  onConfirm,
  onBlink,
}) => {
  const [date, setDate] = useState(new Date());

  const validator = useCallback(
    inputDate => {
      const now = moment();
      const input = moment(inputDate);
      if (input.isBefore(now)) {
        setDate(now.toDate());
      } else {
        setDate(inputDate);
      }
    },
    [setDate]
  );

  const wrappedOnConfirm = useCallback(() => {
    onConfirm(moment(date).startOf('minute').toDate());
  }, [date]);

  const [isDatePickerOpen, onChangeDate, toggleDatePicker] = useDatePicker(validator);
  const [isTimePickerOpen, onChangeTime, toggleTimePicker] = useDatePicker(validator);

  const { [macAddress]: isBlinking } = useSelector(BlinkSelector.isBlinking);

  const maximumDate = moment().add(30, 'days').toDate();
  const minimumDate = new Date();

  return (
    <>
      <SettingsEditModal
        title={t('CONNECT_WITH_SENSOR')}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={wrappedOnConfirm}
        Content={
          <Column style={styles.column}>
            <Row flex={1} alignItems="center" justifyContent="center">
              {isBlinking ? (
                <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
              ) : (
                <Button text={t('BLINK')} variant="dark" onPress={onBlink} />
              )}
            </Row>
            <Row
              alignItems="center"
              justifyContent="space-between"
              flex={1}
              style={{ marginHorizontal: 20 }}
            >
              <Column style={styles.loggingColumns.one}>
                <NormalText colour={COLOUR.GREY_ONE}>{t('START_LOGGING_FROM')}</NormalText>
              </Column>

              <Pressable style={styles.loggingColumns.two} onPress={() => toggleDatePicker()}>
                <Row justifyContent="space-between">
                  <NormalText colour={COLOUR.GREY_ONE}>
                    {moment(date).format(FORMAT.DATE.STANDARD_DATE)}
                  </NormalText>
                  <Icon.Calendar />
                </Row>
              </Pressable>

              <Pressable style={styles.loggingColumns.three} onPress={() => toggleTimePicker()}>
                <Row justifyContent="space-between">
                  <NormalText colour={COLOUR.GREY_ONE}>
                    {moment(date).format(FORMAT.DATE.STANDARD_TIME)}
                  </NormalText>
                  <Icon.Calendar />
                </Row>
              </Pressable>
            </Row>
          </Column>
        }
      />
      {isDatePickerOpen && (
        <DateTimePicker
          value={new Date()}
          onChange={onChangeDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          mode="date"
          display="calendar"
        />
      )}
      {isTimePickerOpen && (
        <DateTimePicker
          value={new Date()}
          onChange={onChangeTime}
          mode="time"
          display="spinner"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </>
  );
};
