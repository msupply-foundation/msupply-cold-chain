import React, { useEffect, FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import moment from 'moment';

import { SettingsList } from '../../layouts';

import {
  SettingsTextInputRow,
  SettingsGroup,
  SettingsButtonRow
} from '../../components/settings';


import { SyncAction, SyncSelector } from '../../../features/Sync';
import { FORMAT } from '../../../common/constants';

export const SyncSettingsScreen: FC = () => {
  const lastSync: number = useSelector(SyncSelector.getLastSync);
  const isPassiveSyncEnabled: boolean = useSelector(SyncSelector.getIsPassiveSyncEnabled);

  const username: string = useSelector(SyncSelector.getUsername);
  const password: string = useSelector(SyncSelector.getPassword);
  const loginUrl: string = useSelector(SyncSelector.getLoginUrl);
  const sensorUrl: string = useSelector(SyncSelector.getSensorUrl);
  const temperatureLogUrl: string = useSelector(SyncSelector.getTemperatureLogUrl);
  const temperatureBreachUrl: string = useSelector(SyncSelector.getTemperatureBreachUrl);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SyncAction.fetchAll());
  }, []);

  return (
    <SettingsList>
      <SettingsGroup title="Server configuration">
        <SettingsTextInputRow
          label="Login"
          subtext="Login URL"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateLoginUrl(inputValue))}
          value={loginUrl}
          editDescription="Edit login URL"
        />
        <SettingsTextInputRow
          label="Sensors"
          subtext="Sensor URL"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateSensorUrl(inputValue))}
          value={sensorUrl}
          editDescription="Edit sensor URL"
        />
        <SettingsTextInputRow
          label="Temperatures"
          subtext="Temperature log URL"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateTemperatureLogUrl(inputValue))}
          value={temperatureLogUrl}
          editDescription="Edit temperature log URL"
        />
        <SettingsTextInputRow
          label="Breaches"
          subtext="Temperature breach URL"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateTemperatureBreachUrl(inputValue))}
          value={temperatureBreachUrl}
          editDescription="Edit temperature breach URL"
        />
      </SettingsGroup>
      <SettingsGroup title="Store credentials">
        <SettingsTextInputRow
          label="Username"
          subtext="Username"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateUsername(inputValue))}
          value={username}
          editDescription="Edit username"
        />
        <SettingsTextInputRow
          label="Password"
          subtext="Password"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updatePassword(inputValue))}
          value={password}
          editDescription="Edit password"
        />
      </SettingsGroup>
      <SettingsGroup title="Operations">
        <SettingsButtonRow
          label="Authenticate"
          subtext="Authenticate with server"
          onPress={() => dispatch(SyncAction.authenticate(loginUrl, username, password))} 
        />
        <SettingsButtonRow
          label="Sync all records"
          subtext="Syncs all records currently stored in sync queue"
          onPress={() => dispatch(SyncAction.syncAll(loginUrl, sensorUrl, temperatureLogUrl, temperatureBreachUrl, username, password))} 
        />
        {
          isPassiveSyncEnabled ? (
            <SettingsButtonRow
              label="Stop sync scheduler"
              subtext={`Stops sync scheduler (last sync: ${moment.unix(lastSync).format(FORMAT.DATE.STANDARD_DATE)})`}
              onPress={() => dispatch(SyncAction.disablePassiveSync())} 
            />
          ) : (
            <SettingsButtonRow
              label="Start sync scheduler"
              subtext={`Starts sync scheduler (last sync: ${moment.unix(lastSync).format(FORMAT.DATE.STANDARD_DATE)})`}
              onPress={() => dispatch(SyncAction.enablePassiveSync())} 
            />
          )
        }
      </SettingsGroup>
    </SettingsList>
  );
};