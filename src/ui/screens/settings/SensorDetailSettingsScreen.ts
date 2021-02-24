import { RootState } from './../../../common/store/store';
import { SettingsStackParameters } from './../../containers/SettingsStackNavigator';
import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as Yup from 'yup';
import { t } from 'common/translations';

import { useRouteProps } from '../../hooks';

import { SettingsList } from '../../layouts';

import {
  SettingsLoadingIndicatorRow,
  SettingsTextInputRow,
  SettingsGroup,
  SettingsNumberInputRow,
  SettingsButtonRow,
  SettingsItem,
} from 'ui/components/settings';

import {
  ProgramAction,
  DownloadAction,
  BlinkAction,
  BlinkSelector,
  SensorAction,
} from '../../../features';
import { RouteProp } from '@react-navigation/core';
import { SETTINGS_STACK } from '../../../common/constants';
import { StackNavigationProp } from '@react-navigation/stack';

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

  const sensor = useSelector((state: RootState): any => state.entities.sensor.byId[id]);

  return null;
  // const dispatch = useDispatch();
  // const { name, logInterval, macAddress } = sensor;
  // const { [macAddress]: isBlinking } = useSelector(BlinkSelector.isBlinking);
  // return (
  //   <SettingsList>
  //     <SettingsLoadingIndicatorRow
  //       label="Blink"
  //       onPress={() => dispatch(BlinkAction.tryBlinkSensor(macAddress))}
  //       isLoading={isBlinking}
  //     />
  //     <SettingsButtonRow
  //       label="Download"
  //       onPress={() => dispatch(DownloadAction.tryManualDownloadForSensor(id))}
  //     />
  //     <SettingsGroup title="SENSOR DETAILS">
  //       <SettingsItem label={macAddress} subtext="This sensors mac address" isDisabled />
  //       <SettingsItem
  //         label={`${sensor.batteryLevel}%`}
  //         subtext="This sensors battery level"
  //         isDisabled
  //       />
  //     </SettingsGroup>
  //     <SettingsGroup title={t('EDIT_SENSOR_DETAILS')}>
  //       <SettingsTextInputRow
  //         label={t('SENSOR_NAME')}
  //         subtext={t('SENSOR_NAME_SUBTEXT')}
  //         value={name}
  //         validation={Yup.string()
  //           .required(t('REQUIRED'))
  //           .max(20, t('MAX_CHARACTERS', { number: 20 }))}
  //         onConfirm={({ inputValue }) => dispatch(SensorAction.update(id, 'name', inputValue))}
  //         editDescription={t('EDIT_SENSOR_NAME')}
  //       />
  //       <SettingsNumberInputRow
  //         label={t('LOG_INTERVAL')}
  //         subtext={t('LOG_INTERVAL_SUBTEXT')}
  //         initialValue={logInterval / 60}
  //         maximumValue={30}
  //         minimumValue={1}
  //         step={1}
  //         metric={t('MINUTES')}
  //         onConfirm={({ value }) => {
  //           const newLogInterval = value * 60;
  //           dispatch(ProgramAction.tryUpdateLogInterval(macAddress, newLogInterval));
  //         }}
  //         editDescription={t('EDIT_LOG_INTERVAL')}
  //       />
  //     </SettingsGroup>
  //   </SettingsList>
  // );
};
