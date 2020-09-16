import React, { useEffect, useState } from 'react';
import { ActivityIndicator, InteractionManager } from 'react-native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { t } from '~translations';
import { COLOUR, NAVIGATION, SETTING } from '~constants';
import { SettingAction, SensorSelector } from '~features/Entities';

import { SettingsList } from '~layouts';
import { UpdatingSensorModal } from '~components/modal';
import {
  SettingsNumberInputRow,
  SettingsGroup,
  SettingsNavigationRow,
  SettingsAddSensorRow,
} from '~components/settings';
import { ScanAction, ScanSelector } from '../../../features/Bluetooth';

export const SensorSettingsScreen = React.memo(({ navigation }) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [load, setLoad] = useState();

  const availableSensors = useSelector(SensorSelector.availableSensorsList, shallowEqual);
  const foundSensors = useSelector(ScanSelector.foundSensors, shallowEqual);
  const isScanning = useSelector(ScanSelector.isScanning);

  useEffect(() => {
    InteractionManager.runAfterInteractions(setLoad(true));
  }, []);

  const defaultLoggingInterval = useSelector(
    state => state.entities.setting[SETTING.INT.DEFAULT_LOG_INTERVAL],
    shallowEqual
  );

  useEffect(() => {
    const reset = () => {
      dispatch(ScanAction.tryStop());
    };
    if (isFocused) dispatch(ScanAction.tryStart());
    else reset();
    return reset;
  }, [isFocused]);

  return !load ? null : (
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
          onConfirm={({ value }) =>
            dispatch(SettingAction.update(SETTING.INT.DEFAULT_LOG_INTERVAL, value * 60))}
          initialValue={defaultLoggingInterval / 60}
          editDescription={t('DEFAULT_LOG_INTERVAL')}
          maximumValue={30}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
        />
      </SettingsGroup>

      <SettingsGroup title={t('FOUND_SENSORS')}>
        {foundSensors.map(macAddress => (
          <SettingsAddSensorRow key={macAddress} macAddress={macAddress} />
        ))}
        {isScanning ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color={COLOUR.SECONDARY} />
        ) : null}
      </SettingsGroup>

      <UpdatingSensorModal />
    </SettingsList>
  );
});
