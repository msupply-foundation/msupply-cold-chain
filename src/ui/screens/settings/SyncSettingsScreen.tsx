import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';
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
import { ENDPOINT } from '~features/Sync/SyncSlice';

export const SyncSettingsScreen: FC = () => {
  const { serverUrl, authUsername, authPassword, isIntegrating } = useSelector(
    SettingSelector.getSettings
  );

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
          label={t('SERVER')}
          subtext={t('SERVER_URL')}
          onConfirm={
            ({ inputValue }: { inputValue: string }) =>
              dispatch(SettingAction.update('serverUrl', inputValue.replace(/\/$/, ''))) // trim final / from the URL if present
          }
          value={serverUrl}
          editDescription={t('EDIT_SERVER_URL')}
          validation={Yup.string().url()}
        />
      </SettingsGroup>
      <SettingsGroup title={t('CREDENTIALS')}>
        <SettingsTextInputRow
          label={t('USERNAME')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('authUsername', inputValue))
          }
          value={authUsername}
          editDescription={t('EDIT_USERNAME')}
        />
        <SettingsTextInputRow
          label={t('PASSWORD')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.update('authPassword', inputValue))
          }
          value={authPassword}
          editDescription={t('EDIT_PASSWORD')}
          secureTextEntry
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
            dispatch(
              SyncAction.tryTestConnection(
                `${serverUrl}/${ENDPOINT.LOGIN}`,
                authUsername,
                authPassword
              )
            )
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
