import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { SettingsList } from '~layouts';
import {
  SettingsTextInputRow,
  SettingsGroup,
  SettingsButtonRow,
  SettingsItem,
} from '~components/settings';
import { SettingAction, SettingSelector, SyncAction, SyncSelector } from '~features';
import { t } from '~common/translations';
import { useOnMount } from '~hooks';

export const SyncSettingsScreen: FC = () => {
  const {
    authUrl,
    authUsername,
    authPassword,
    sensorUrl,
    temperatureLogUrl,
    temperatureBreachUrl,
    isIntegrating,
  } = useSelector(SettingSelector.getSettings);

  const syncQueueLength = useSelector(SyncSelector.getSyncQueueCount);

  const dispatch = useDispatch();

  useOnMount([
    () => dispatch(SyncAction.tryCountSyncQueue()),
    () => dispatch(SettingAction.fetchAll()),
  ]);

  return (
    <SettingsList>
      <SettingsGroup title="Server configuration">
        <SettingsTextInputRow
          label={t('LOGIN')}
          subtext={t('LOGIN_URL')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('authUrl', inputValue))
          }
          value={authUrl}
          editDescription={t('EDIT_LOGIN_URL')}
        />
        <SettingsTextInputRow
          label={t('SENSORS')}
          subtext={t('SENSOR_URL')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('sensorUrl', inputValue))
          }
          value={sensorUrl}
          editDescription={t('EDIT_SENSOR_URL')}
        />
        <SettingsTextInputRow
          label={t('TEMPERATURES')}
          subtext={t('TEMPERATURE_URL')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('temperatureLogUrl', inputValue))
          }
          value={temperatureLogUrl}
          editDescription={t('EDIT_TEMPERATURE_URL')}
        />
        <SettingsTextInputRow
          label={t('TEMPERATURE_BREACHES')}
          subtext={t('TEMPERATURE_BREACHES_URL')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('temperatureBreachUrl', inputValue))
          }
          value={temperatureBreachUrl}
          editDescription={t('EDIT_TEMPERATURE_BREACHES_URL')}
        />
      </SettingsGroup>
      <SettingsGroup title={t('CREDENTIALS')}>
        <SettingsTextInputRow
          label={t('USERNAME')}
          subtext={t('USERNAME')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('authUsername', inputValue))
          }
          value={authUsername}
          editDescription={t('EDIT_USERNAME')}
        />
        <SettingsTextInputRow
          label={t('PASSWORD')}
          subtext={t('PASSWORD')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('authPassword', inputValue))
          }
          value={authPassword}
          editDescription={t('EDIT_PASSWORD')}
        />
      </SettingsGroup>
      <SettingsGroup title="Operations">
        {isIntegrating ? (
          <SettingsButtonRow
            label={t('STOP_INTEGRATION')}
            subtext={t('STOP_INTEGRATION_SUBTEXT')}
            onPress={() => {
              dispatch(SettingAction.update('isIntegrating', false));
              dispatch(SyncAction.disablePassiveSync());
            }}
          />
        ) : (
          <SettingsButtonRow
            label={t('START_INTEGRATION')}
            subtext={t('START_INTEGRATION_SUBTEXT')}
            onPress={() => {
              dispatch(SettingAction.update('isIntegrating', true));
              dispatch(SyncAction.enablePassiveSync());
            }}
          />
        )}
        <SettingsButtonRow
          label={t('TEST_CONNECTION')}
          subtext={t('TEST_CONNECTION_SUBTEXT')}
          onPress={() =>
            dispatch(SyncAction.tryTestConnection(authUrl, authUsername, authPassword))
          }
        />
        <SettingsGroup title="Info">
          <SettingsItem
            label="Number of records to send"
            subtext={String(syncQueueLength)}
            isDisabled
          />
        </SettingsGroup>
      </SettingsGroup>
    </SettingsList>
  );
};
