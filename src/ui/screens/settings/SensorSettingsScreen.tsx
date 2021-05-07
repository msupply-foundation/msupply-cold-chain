import React, { FC, useEffect, useState } from 'react';
import { ActivityIndicator, InteractionManager } from 'react-native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { t } from '../../../common/translations';
import { COLOUR, SETTINGS_STACK } from '../../../common/constants';
import { SettingAction, SettingSelector, SensorSelector } from '../../../features/Entities';

import { SettingsList } from '../../layouts';
import { UpdatingSensorModal } from '../../components/modal';
import {
  SettingsNumberInputRow,
  SettingsGroup,
  SettingsNavigationRow,
  SettingsAddSensorRow,
} from '../../components/settings';
import { ScanAction, ScanSelector } from '../../../features/Bluetooth';

import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';

type SensorSettingsScreenProps = {
  navigation: StackNavigationProp<SettingsStackParameters, SETTINGS_STACK.MENU>;
};

export const SensorSettingsScreen: FC<SensorSettingsScreenProps> = React.memo(({ navigation }) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [load, setLoad] = useState(false);

  const availableSensors = useSelector(SensorSelector.availableSensorsList, shallowEqual);
  const foundSensors = useSelector(ScanSelector.foundSensors, shallowEqual);
  const isScanning = useSelector(ScanSelector.isScanning);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => setLoad(true));
  }, []);

  const defaultLoggingInterval = useSelector(SettingSelector.getDefaultLogInterval, shallowEqual);

  useEffect(() => {
    const reset = () => {
      dispatch(ScanAction.tryStop());
    };

    if (isFocused) dispatch(ScanAction.tryStart());
    else reset();
    return reset;
  }, [dispatch, isFocused]);

  return !load ? null : (
    <SettingsList>
      {!!availableSensors.length && (
        <SettingsGroup title={t('AVAILABLE_SENSORS')}>
          {availableSensors.map(({ name, id }) => (
            <SettingsNavigationRow
              key={id}
              subtext=""
              Icon={null}
              label={name}
              onPress={() => navigation.navigate(SETTINGS_STACK.SENSOR_DETAIL, { id })}
            />
          ))}
        </SettingsGroup>
      )}

      <SettingsGroup title={t('OPTIONS')}>
        <SettingsNumberInputRow
          label={t('DEFAULT_LOG_INTERVAL')}
          subtext={t('DEFAULT_LOG_INTERVAL_SUBTEXT')}
          onConfirm={({ value }: { value: number }) =>
            dispatch(SettingAction.updateBluetoothDefaultLogInterval(value * 60))
          }
          initialValue={Number(defaultLoggingInterval) / 60}
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
