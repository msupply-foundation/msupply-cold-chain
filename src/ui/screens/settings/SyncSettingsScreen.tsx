import React, { useEffect, FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { SettingsList } from '../../layouts';

import {
  SettingsTextInputRow,
  SettingsGroup,
  SettingsButtonRow
} from '../../components/settings';

import { SyncAction, SyncSelector } from '../../../features/Sync';

export const SyncSettingsScreen: FC = () => {
  const host: string = useSelector(SyncSelector.getHost);
  const port: string = useSelector(SyncSelector.getPort);
  const username: string = useSelector(SyncSelector.getUsername);
  const password: string = useSelector(SyncSelector.getPassword);
  const loginPath: string = useSelector(SyncSelector.getLoginPath);
  const sensorPath: string = useSelector(SyncSelector.getSensorPath);
  const temperatureLogPath: string = useSelector(SyncSelector.getTemperatureLogPath);
  const temperatureBreachPath: string = useSelector(SyncSelector.getTemperatureBreachPath);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SyncAction.fetchAll());
  }, []);

  return (
    <SettingsList>
      <SettingsGroup title="Server configuration">
        <SettingsTextInputRow
          label="Server host"
          subtext="Server host"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateHost(inputValue))}
          value={host}
          editDescription="Edit server host"
        />
        <SettingsTextInputRow
          label="Server port"
          subtext="Server port"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updatePort(inputValue))}
          value={port}
          editDescription="Edit server port"
        />
        <SettingsTextInputRow
          label="Login path"
          subtext="Login path"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateLoginPath(inputValue))}
          value={loginPath}
          editDescription="Edit login path"
        />
        <SettingsTextInputRow
          label="Sensor path"
          subtext="Sensor path"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateSensorPath(inputValue))}
          value={sensorPath}
          editDescription="Edit server port"
        />
        <SettingsTextInputRow
          label="Temperature log path"
          subtext="Temperature log path"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateTemperatureLogPath(inputValue))}
          value={temperatureLogPath}
          editDescription="Edit temperature log path"
        />
        <SettingsTextInputRow
          label="Temperature breach path"
          subtext="Temperature breach path"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateTemperatureBreachPath(inputValue))}
          value={temperatureBreachPath}
          editDescription="Edit temperature breach path"
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
          onPress={() => dispatch(SyncAction.authenticate())} 
        />
        <SettingsButtonRow
          label="Sync all records"
          subtext="Syncs all records currently stored in sync queue"
          onPress={() => dispatch(SyncAction.syncAll())} 
        />
      </SettingsGroup>
    </SettingsList>
  );
};