import React, { useState, useCallback, FC } from 'react';
import { useSelector } from 'react-redux';
import { Pressable, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useDatePicker, useFormatter, useUtils } from '~hooks';
import { COLOUR, STYLE } from '~constants';
import { t } from '~translations';
import { Column, Row } from '~layouts';
import { NormalText } from '~presentation/typography';
import { Button } from '../buttons';

import { SettingsEditModal } from './SettingsEditModal';
import { BlinkSelector } from '~features/Bluetooth';
import { Icon } from '~presentation/icons';
import { UnixTimestamp } from '~common/types/common';

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
  onConfirm(date: UnixTimestamp): void;
  onBlink(): void;
}

export const SettingsAddSensorModal: FC<SettingsAddSensorModalProps> = ({
  macAddress,
  onClose,
  isOpen,
  onConfirm,
  onBlink,
}) => {
  const utils = useUtils();
  const formatter = useFormatter();
  const [date, setDate] = useState(utils.now());

  const dateValidator = useCallback(
    inputDate => {
      const now = utils.now();
      const input = utils.toUnixTimestamp(inputDate);
      const newDate = utils.setDateValue(date, input);
      if (now < newDate) {
        setDate(newDate);
      }
    },
    [setDate, utils, date]
  );

  const timeValidator = useCallback(
    inputDate => {
      const now = utils.now();
      const input = utils.toUnixTimestamp(inputDate);
      const newDate = utils.setTimeValue(date, input);
      if (newDate < now) {
        setDate(newDate);
      }
    },
    [setDate, utils, date]
  );

  const [isDatePickerOpen, onChangeDate, toggleDatePicker] = useDatePicker(dateValidator);
  const [isTimePickerOpen, onChangeTime, toggleTimePicker] = useDatePicker(timeValidator);

  const { [macAddress]: isBlinking } = useSelector(BlinkSelector.isBlinking);

  const maximumDate = utils.addDays(utils.now(), 30) * 1000;
  const minimumDate = utils.now() * 1000;
  return (
    <>
      <SettingsEditModal
        title={t('CONNECT_WITH_SENSOR')}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => onConfirm(date)}
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
                <NormalText color={COLOUR.GREY_ONE}>{t('START_LOGGING_FROM')}</NormalText>
              </Column>

              <Pressable style={styles.loggingColumns.two} onPress={() => toggleDatePicker()}>
                <Row justifyContent="space-between">
                  <NormalText color={COLOUR.GREY_ONE}>{formatter.standardDate(date)}</NormalText>
                  <Icon.Calendar />
                </Row>
              </Pressable>

              <Pressable style={styles.loggingColumns.three} onPress={() => toggleTimePicker()}>
                <Row justifyContent="space-between">
                  <NormalText color={COLOUR.GREY_ONE}>{formatter.standardTime(date)}</NormalText>
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
          minimumDate={new Date(minimumDate)}
          maximumDate={new Date(maximumDate)}
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
          minimumDate={new Date(minimumDate)}
          maximumDate={new Date(maximumDate)}
        />
      )}
    </>
  );
};
