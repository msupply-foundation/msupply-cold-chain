import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import { t } from '../../../common/translations';

import { useRouteProps } from '../../hooks';

import { SettingsList } from '../../layouts';
import { RootState } from '../../../common/store/store';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';
import {
  SettingsLoadingIndicatorRow,
  SettingsTextInputRow,
  SettingsGroup,
  SettingsNumberInputRow,
  SettingsButtonRow,
  SettingsItem,
} from '../../components/settings';

import {
  ProgramAction,
  DownloadAction,
  BlinkAction,
  BlinkSelector,
  SensorAction,
} from '../../../features';
import { SETTINGS_STACK } from '../../../common/constants';

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
  const { id } = useRouteProps<SettingsStackParameters, SETTINGS_STACK.SENSOR_DETAIL>();

  const sensor = useSelector((state: RootState) => state.entities.sensor.byId[id]);

  const dispatch = useDispatch();
  const { name, logInterval, macAddress } = sensor;
  const { [macAddress]: isBlinking } = useSelector(BlinkSelector.isBlinking);
  return (
    <SettingsList>
      <SettingsLoadingIndicatorRow
        label="Blink"
        onPress={() => dispatch(BlinkAction.tryBlinkSensor(macAddress))}
        isLoading={isBlinking}
      />
      <SettingsButtonRow
        subtext=""
        label="Download"
        onPress={() => dispatch(DownloadAction.tryManualDownloadForSensor(id))}
      />
      <SettingsGroup title="SENSOR DETAILS">
        <SettingsItem label={macAddress} subtext="This sensors mac address" isDisabled />
        <SettingsItem
          label={`${sensor.batteryLevel}%`}
          subtext="This sensors battery level"
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
          onConfirm={({ inputValue }: { inputValue: number }) =>
            dispatch(SensorAction.update(id, 'name', inputValue))
          }
          editDescription={t('EDIT_SENSOR_NAME')}
        />
        <SettingsNumberInputRow
          label={t('LOG_INTERVAL')}
          subtext={t('LOG_INTERVAL_SUBTEXT')}
          initialValue={logInterval / 60}
          maximumValue={30}
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
