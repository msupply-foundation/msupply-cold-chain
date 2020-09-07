import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { SensorAction } from '~sensor';
import { useRouteProps } from '~hooks';

import { t } from '~translations';
import { SettingsList } from '~layouts';

import {
  SettingsLoadingIndicatorRow,
  SettingsTextInputRow,
  SettingsGroup,
  SettingsNumberInputRow,
  SettingsButtonRow,
  SettingsItem,
} from '~components/settings';

import { BlinkAction } from '../../../features/bluetooth/blink';
import { DownloadAction } from '../../../features/bluetooth/download';
import { UpdateAction } from '../../../features/bluetooth/update';

export const SensorDetailScreen = () => {
  const { id } = useRouteProps();
  const sensor = useSelector(state => state.sensor.byId[id]);
  const blinkingSensor = useSelector(state => state.bluetooth.bluetooth.blinkingSensor);
  const blinkWasSuccessful = useSelector(state => state.bluetooth.bluetooth.blinkWasSuccessful);
  const dispatch = useDispatch();

  const { name, logInterval, macAddress } = sensor;
  return (
    <SettingsList>
      <SettingsLoadingIndicatorRow
        label="Blink"
        onPress={() => dispatch(BlinkAction.tryBlinkSensor(macAddress))}
        isLoading={blinkingSensor}
        wasSuccessful={blinkWasSuccessful}
      />
      <SettingsButtonRow
        label="Download"
        onPress={() => dispatch(DownloadAction.tryManualDownloadForSensor(id))}
      />
      <SettingsGroup title="SENSOR DETAILS">
        <SettingsItem label={sensor.macAddress} subtext="This sensors mac address" isDisabled />
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
          onConfirm={({ inputValue }) => dispatch(SensorAction.update(id, 'name', inputValue))}
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
          onConfirm={({ value }) => {
            const newLogInterval = value * 60;
            dispatch(UpdateAction.tryUpdateLogInterval(id, newLogInterval));
          }}
          editDescription={t('EDIT_LOG_INTERVAL')}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
