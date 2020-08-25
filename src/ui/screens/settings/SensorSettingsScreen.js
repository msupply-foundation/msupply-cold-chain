import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { t } from '~translations';
import { COLOUR, NAVIGATION, SETTING } from '~constants';
import { SensorSelector, SensorAction } from '~sensor';
import { BluetoothStateActions } from '~bluetooth';

import { SettingsList } from '~layouts';
import { UpdatingSensorModal } from '~components';
import {
  SettingsNumberInputRow,
  SettingsGroup,
  SettingsNavigationRow,
  SettingsAddSensorRow,
} from '~components/settings';
import { SettingAction } from '~setting';

export const SensorSettingsScreen = ({ navigation }) => {
  const isFocused = useIsFocused();

  const dispatch = useDispatch();
  const availableSensors = useSelector(SensorSelector.availableSensorsList);
  const foundSensors = useSelector(SensorSelector.foundSensorsList);
  const findingSensors = useSelector(state => state.bluetooth.bluetooth.findingSensors);

  const defaultLoggingInterval = useSelector(
    state => state.setting[SETTING.INT.DEFAULT_LOG_INTERVAL]
  );

  useEffect(() => {
    const reset = () => {
      dispatch(BluetoothStateActions.stopScanning());
      dispatch(SensorAction.clearFoundSensors());
    };
    if (isFocused) dispatch(BluetoothStateActions.findSensors());
    else reset();
    return reset;
  }, [isFocused]);

  return (
    <SettingsList>
      {!!availableSensors.length && (
        <SettingsGroup title={t('AVAILABLE_SENSORS')}>
          {availableSensors.map(({ name, id }) => (
            <SettingsNavigationRow
              key={id}
              label={name}
              onPress={() =>
                navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.SENSOR_DETAIL, { id })}
            />
          ))}
        </SettingsGroup>
      )}
      <SettingsGroup title={t('OPTIONS')}>
        <SettingsNumberInputRow
          label={t('DEFAULT_LOG_INTERVAL')}
          subtext={t('DEFAULT_LOG_INTERVAL_SUBTEXT')}
          onConfirm={value =>
            dispatch(SettingAction.updatedSetting(SETTING.INT.DEFAULT_LOG_INTERVAL, value * 60))}
          initialValue={defaultLoggingInterval / 60}
          editDescription={t('DEFAULT_LOG_INTERVAL')}
          maximumValue={100}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
        />
        <SettingsGroup title={t('FOUND_SENSORS')}>
          {foundSensors.map(macAddress => (
            <SettingsAddSensorRow key={macAddress} macAddress={macAddress} />
          ))}
          {findingSensors ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color={COLOUR.SECONDARY} />
          ) : null}
        </SettingsGroup>
      </SettingsGroup>
      <UpdatingSensorModal />
    </SettingsList>
  );
};
