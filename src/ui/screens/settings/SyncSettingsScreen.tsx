import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { SettingsList } from '../../layouts';

import {
  SettingsTextInputRow,
  SettingsGroup,
  SettingsButtonRow
} from '../../components/settings';

import { SyncAction, SyncSelector } from '../../../features/Sync';

export const SyncSettingsScreen: FC = () => {
  const url: string = useSelector(SyncSelector.getUrl);
  const username: string = useSelector(SyncSelector.getUsername);
  const password: string = useSelector(SyncSelector.getPassword);

  const dispatch = useDispatch();

  return (
    <SettingsList>
      <SettingsGroup title="Server configuration">
        <SettingsTextInputRow
          label="Server URL"
          subtext="Server URL"
          onConfirm={({inputValue}: { inputValue: string }) => dispatch(SyncAction.updateUrl(inputValue))}
          value={url}
          editDescription="Edit server URL"
        />
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
      <SettingsGroup title="Sync records">
        <SettingsButtonRow
          label="Sync all records"
          subtext="Syncs all records currently stored in sync queue"
          onPress={() => dispatch(SyncAction.syncAll())} 
        />
      </SettingsGroup>
    </SettingsList>
  );
};