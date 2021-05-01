import React, { useEffect, FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import moment from 'moment';

import { SettingsList } from '../../layouts';

import { SettingsTextInputRow, SettingsGroup, SettingsButtonRow } from '~components/settings';
import { SettingAction, SettingSelector, SyncAction } from '~features';
import { FORMAT } from '~constants';
import { SyncSettingSlice } from '~features/Entities/Setting/SettingSlice';

export const SyncSettingsScreen: FC = () => {
  const {
    [SyncSettingSlice.AuthUrl]: authUrl,
    [SyncSettingSlice.AuthUsername]: authUsername,
    [SyncSettingSlice.AuthPassword]: authPassword,
    [SyncSettingSlice.SensorUrl]: sensorUrl,
    [SyncSettingSlice.TemperatureLogUrl]: temperatureLogUrl,
    [SyncSettingSlice.TemperatureBreachUrl]: temperatureBreachUrl,
    [SyncSettingSlice.LastSync]: lastSync,
    [SyncSettingSlice.IsPassiveSyncEnabled]: isPassiveSyncEnabled,
  } = useSelector(SettingSelector.getSyncSettings);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SettingAction.fetchAll());
  }, [dispatch]);

  return (
    <SettingsList>
      <SettingsGroup title="Server configuration">
        <SettingsTextInputRow
          label="Login"
          subtext="Login URL"
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.updateSyncAuthUrl(inputValue))
          }
          value={authUrl as string}
          editDescription="Edit login URL"
        />
        <SettingsTextInputRow
          label="Sensors"
          subtext="Sensor URL"
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.updateSyncSensorUrl(inputValue))
          }
          value={sensorUrl as string}
          editDescription="Edit sensor URL"
        />
        <SettingsTextInputRow
          label="Temperatures"
          subtext="Temperature log URL"
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.updateSyncTemperatureLogUrl(inputValue))
          }
          value={temperatureLogUrl as string}
          editDescription="Edit temperature log URL"
        />
        <SettingsTextInputRow
          label="Breaches"
          subtext="Temperature breach URL"
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.updateSyncTemperatureBreachUrl(inputValue))
          }
          value={temperatureBreachUrl as string}
          editDescription="Edit temperature breach URL"
        />
      </SettingsGroup>
      <SettingsGroup title="Store credentials">
        <SettingsTextInputRow
          label="Username"
          subtext="Username"
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.updateSyncAuthUsername(inputValue))
          }
          value={authUsername as string}
          editDescription="Edit username"
        />
        <SettingsTextInputRow
          label="Password"
          subtext="Password"
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(SettingAction.updateSyncAuthPassword(inputValue))
          }
          value={authPassword as string}
          editDescription="Edit password"
        />
      </SettingsGroup>
      <SettingsGroup title="Operations">
        <SettingsButtonRow
          label="Authenticate"
          subtext="Authenticate with server"
          onPress={() =>
            dispatch(
              SyncAction.authenticate(
                authUrl as string,
                authUsername as string,
                authPassword as string
              )
            )
          }
        />
        <SettingsButtonRow
          label="Sync all records"
          subtext="Syncs all records currently stored in sync queue"
          onPress={() =>
            dispatch(
              SyncAction.syncAll(
                authUrl as string,
                sensorUrl as string,
                temperatureLogUrl as string,
                temperatureBreachUrl as string,
                authUsername as string,
                authPassword as string
              )
            )
          }
        />
        {isPassiveSyncEnabled ? (
          <SettingsButtonRow
            label="Stop sync scheduler"
            subtext={`Stops sync scheduler (last sync: ${moment
              .unix(lastSync as number)
              .format(FORMAT.DATE.STANDARD_DATE)})`}
            onPress={() => dispatch(SyncAction.disablePassiveSync())}
          />
        ) : (
          <SettingsButtonRow
            label="Start sync scheduler"
            subtext={`Starts sync scheduler (last sync: ${moment
              .unix(lastSync as number)
              .format(FORMAT.DATE.STANDARD_DATE)})`}
            onPress={() => dispatch(SyncAction.enablePassiveSync())}
          />
        )}
      </SettingsGroup>
    </SettingsList>
  );
};
