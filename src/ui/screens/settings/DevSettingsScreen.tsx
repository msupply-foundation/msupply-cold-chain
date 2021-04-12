import { SyncAction } from '../../../features/Sync';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SensorAction, SensorManager, SensorSelector } from '../../../features/Entities';

import { SettingsButtonRow, SettingsGroup } from '../../components/settings';
import { SettingsList } from '../../layouts';
import { useDependency } from '../../../ui/hooks';
import { DEPENDENCY } from '../../../common/constants';
import { DevAction } from '../../../features';
import { DevService } from '../../../common/services';

export const DevSettingsScreen: FC = () => {
  const dispatch = useDispatch();

  const sensorManager: SensorManager = useDependency(DEPENDENCY.SENSOR_MANAGER) as SensorManager;
 
  const availableSensors = useSelector(SensorSelector.sensorsList);

  const devService = new DevService();

  return (
    <SettingsList>
      <SettingsGroup title="Add records">
        <SettingsButtonRow
          label="Add random sensor"
          subtext="Adds a random sensor with a random mac address and default values"
          onPress={() => dispatch(SensorAction.create(devService.randomMac(), 300, 0, 100))}
        />
        {
          availableSensors.map(sensorState => {
            return (
              <SettingsButtonRow
                key={sensorState?.id}
                label="Create sensor logs"
                subtext={`Add logs for ${sensorState?.name ?? sensorState.macAddress}`}
                onPress={async () => {
                  const sensor = await sensorManager.getSensor(sensorState.macAddress);
                  dispatch(DevAction.generateBreachLogs(sensor));
                }}
              />
            );
          })
        }
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
