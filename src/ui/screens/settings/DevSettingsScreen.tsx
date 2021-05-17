import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsButtonRow, SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';
import { useDependency } from '~hooks';
import { DEPENDENCY } from '~constants';
import { SensorManager, SensorSelector, DevAction, SyncAction } from '~features';

export const DevSettingsScreen: FC = () => {
  const dispatch = useDispatch();

  const sensorManager: SensorManager = useDependency(DEPENDENCY.SENSOR_MANAGER) as SensorManager;

  const availableSensors = useSelector(SensorSelector.sensorsList);

  return (
    <SettingsList>
      <SettingsGroup title="Add records">
        <SettingsButtonRow
          label="Add random sensor"
          subtext="Adds a random sensor with a random mac address and default values"
          onPress={() => dispatch(DevAction.generateSensor())}
        />
        {availableSensors.map(sensorState => {
          return (
            <SettingsButtonRow
              key={sensorState?.id}
              label="Create sensor logs"
              subtext={`Add logs for ${sensorState?.name ?? sensorState.macAddress}`}
              onPress={async () => {
                const sensor = await sensorManager.getSensor(sensorState.macAddress);
                dispatch(DevAction.generateTemperatureBreach(sensor));
              }}
            />
          );
        })}
      </SettingsGroup>
      <SettingsGroup title="Sync records">
        <SettingsButtonRow
          label="Sync all records"
          subtext="Syncs all records currently stored in sync queue"
          onPress={() => dispatch(SyncAction.enablePassiveSync())}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
