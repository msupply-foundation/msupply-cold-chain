import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp, useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';

import { t } from '~common/translations';
import { useFormatter, useRouteProps } from '~hooks';
import { SettingsList } from '~layouts';
import { RootState } from '~store/store';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';
import {
  SettingsLoadingIndicatorRow,
  SettingsTextInputRow,
  SettingsGroup,
  SettingsNumberInputRow,
  SettingsItem,
  SettingsConfirmRow,
} from '~components/settings';
import { ProgramAction, BlinkAction, BlinkSelector, SensorAction } from '~features';
import { SETTINGS_STACK } from '~constants';
import { SensorState } from '~features/Entities/Sensor/SensorSlice';

export type SensorDetailSettingsScreenRouteProp = RouteProp<
  SettingsStackParameters,
  SETTINGS_STACK.SENSOR_DETAIL
>;

export type SensorDetailSettingsScreenNavigationProp = StackNavigationProp<
  SettingsStackParameters,
  SETTINGS_STACK.SENSOR_DETAIL
>;

type SensorDetailSettingsScreenProps = {
  route: SensorDetailSettingsScreenRouteProp;
  navigation: SensorDetailSettingsScreenNavigationProp;
};

export const SensorDetailSettingsScreen: FC<SensorDetailSettingsScreenProps> = () => {
  const formatter = useFormatter();
  const { id } = useRouteProps<SettingsStackParameters, SETTINGS_STACK.SENSOR_DETAIL>();
  const sensor: SensorState | undefined = useSelector(
    (state: RootState) => state.entities.sensor.byId[id]
  );

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { name, logInterval, macAddress, batteryLevel } = sensor ?? {};
  const { [macAddress]: isBlinking } = useSelector(BlinkSelector.isBlinking);

  return (
    <SettingsList>
      <SettingsLoadingIndicatorRow
        label={t('BLINK')}
        onPress={() => dispatch(BlinkAction.tryBlinkSensor(macAddress))}
        isLoading={isBlinking}
      />
      <SettingsConfirmRow
        subtext=""
        label={t('REMOVE')}
        onPress={() => {
          navigation.goBack();
          dispatch(SensorAction.tryRemove(id));
        }}
        confirmText={t('REMOVE_SENSOR_CONFIRMATION')}
      />
      <SettingsGroup title={t('SENSOR_DETAILS')}>
        <SettingsItem label={macAddress} subtext={t('SENSORS_MAC_ADDRESS')} isDisabled />
        <SettingsItem
          label={formatter.sensorBatteryLevel(batteryLevel)}
          subtext={t('SENSORS_BATTERY_LEVEL')}
          isDisabled
        />
      </SettingsGroup>
      <SettingsGroup title={t('EDIT_SENSOR_DETAILS')}>
        <SettingsTextInputRow
          label={t('SENSOR_NAME')}
          subtext={t('SENSOR_NAME_SUBTEXT')}
          value={name}
          validation={Yup.string()
            .required(t('REQUIRED'))
            .max(20, t('MAX_CHARACTERS', { number: 20 }))}
          onConfirm={({ inputValue }: { inputValue: string }) => {
            dispatch(SensorAction.update(id, 'name', inputValue));
          }}
          editDescription={t('EDIT_SENSOR_NAME')}
        />
        <SettingsNumberInputRow
          label={t('LOG_INTERVAL')}
          subtext={t('LOG_INTERVAL_SUBTEXT')}
          initialValue={logInterval / 60}
          maximumValue={60}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
          onConfirm={({ value }: { value: number }) => {
            const newLogInterval = value * 60;
            dispatch(ProgramAction.tryUpdateLogInterval(macAddress, newLogInterval));
          }}
          editDescription={t('EDIT_LOG_INTERVAL')}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
