/* eslint-disable react/jsx-wrap-multilines */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Pressable, ActivityIndicator } from 'react-native';

import moment from 'moment';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useDatePicker } from '~hooks';
import { FORMAT, COLOUR, STYLE } from '~constants';
import { t } from '~translations';

import { Column, Row } from '~layouts';
import { Calendar } from '~presentation/icons';
import { NormalText } from '~presentation/typography';
import { Button } from '~components/buttons';

import { SettingsEditModal } from './SettingsEditModal';

const styles = {
  column: { maxHeight: STYLE.HEIGHT.SENSOR_ROW },
  loggingColumns: {
    one: { width: '40%' },
    two: { width: '25%' },
    three: { width: '15%' },
  },
};

export const SettingsAddSensorModal = ({ onClose, isOpen, onConfirm, onBlink }) => {
  const [date, setDate] = useState(new Date());

  const [isDatePickerOpen, onChangeDate, toggleDatePicker] = useDatePicker(setDate);
  const [isTimePickerOpen, onChangeTime, toggleTimePicker] = useDatePicker(setDate);

  const blinkingSensor = useSelector(state => state.bluetooth.bluetooth.blinkingSensor);

  return (
    <>
      <SettingsEditModal
        title={t('CONNECT_WITH_SENSOR')}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        Content={
          <Column style={styles.column}>
            <Row flex={1} alignItems="center" justifyContent="center">
              {blinkingSensor ? (
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

              <Pressable style={styles.loggingColumns.two} onPress={toggleDatePicker}>
                <Row justifyContent="space-between">
                  <NormalText colour={COLOUR.GREY_ONE}>
                    {moment(date).format(FORMAT.DATE.STANDARD_DATE)}
                  </NormalText>
                  <Calendar />
                </Row>
              </Pressable>

              <Pressable style={styles.loggingColumns.three} onPress={toggleTimePicker}>
                <Row justifyContent="space-between">
                  <NormalText colour={COLOUR.GREY_ONE}>
                    {moment(date).format(FORMAT.DATE.STANDARD_TIME)}
                  </NormalText>
                  <Calendar />
                </Row>
              </Pressable>
            </Row>
          </Column>
        }
      />
      {isDatePickerOpen && (
        <DateTimePicker value={new Date()} onChange={onChangeDate} mode="date" display="calendar" />
      )}
      {isTimePickerOpen && (
        <DateTimePicker value={new Date()} onChange={onChangeTime} mode="time" display="spinner" />
      )}
    </>
  );
};
