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
import { useFormatter, useOnMount } from '~hooks';
import { ENDPOINT } from '~features/Sync/SyncSlice';
import { QRCodeScanner } from './QRCodeScanner';
import { IconButton } from '~components/buttons';
import { ToastAndroid } from 'react-native';
import { Icon } from '~presentation/icons';

const SYNC_COUNT_UPDATE_INTERVAL = 1000;

export const SyncSettingsScreen: FC = () => {
  const { serverUrl, authUsername, authPassword, isIntegrating, lastSync, lastSyncStart } =
    useSelector(SettingSelector.getSettings);

  const syncQueueLength = useSelector(SyncSelector.getSyncQueueCount);
  const isSyncing = useSelector(SyncSelector.getIsSyncing);
  const [isActive, setIsActive] = React.useState(false);
  const syncError = useSelector(SyncSelector.getSyncError);

  const syncStatus = () => {
    if (!isIntegrating) {
      return 'Disabled';
    }
    if (isSyncing) {
      return `Syncing in progress. Started ${formatter.dateTime(lastSyncStart)}`;
    }
    if (syncError) {
      return `Error ${syncError}. Last successful sync finished ${formatter.dateTime(lastSync)}`;
    }

    return `Idle. Last successful sync finished ${formatter.dateTime(lastSync)}`;
  };

  const dispatch = useDispatch();
  const formatter = useFormatter();
  const saveServerUrl = ({ inputValue }: { inputValue: string }) =>
    dispatch(SettingAction.update('serverUrl', inputValue.replace(/\/$/, ''))); // trim final / from the URL if present

  useOnMount([
    () => setInterval(() => dispatch(SyncAction.tryCountSyncQueue()), SYNC_COUNT_UPDATE_INTERVAL),
    () => dispatch(SettingAction.fetchAll()),
  ]);

  return (
    <SettingsList>
      <SettingsGroup title="Server configuration">
        <SettingsTextInputRow
          ActionButton={<IconButton Icon={<Icon.QRCode />} onPress={() => setIsActive(true)} />}
          label={t('SERVER')}
          subtext={t('SERVER_URL')}
          onConfirm={saveServerUrl}
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
          <SettingsItem label="Status" subtext={syncStatus()} isDisabled />
        </SettingsGroup>
      </SettingsGroup>
      <QRCodeScanner
        isActive={isActive}
        onResult={url => {
          setIsActive(false);
          try {
            Yup.string().url().validateSync(url);
            saveServerUrl({ inputValue: url });
            ToastAndroid.show(`${t('SCAN_RESULT')} ${url}`, ToastAndroid.SHORT);
          } catch (e) {
            ToastAndroid.show(
              `${t('SCAN_RESULT')} ${url}. Error! ${(e as Error).message}`,
              ToastAndroid.LONG
            );
          }
        }}
        onClose={() => setIsActive(false)}
      />
    </SettingsList>
  );
};
