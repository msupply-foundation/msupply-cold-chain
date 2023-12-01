import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsButtonRow, SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';
import { useDependency } from '~hooks';
import { DEPENDENCY } from '~constants';
import { SensorManager, SensorSelector, DevAction } from '~features';
import { SettingsGenerateLogsInputRow } from '~components/settings/SettingsGenerateLogsInputRow';

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
            <SettingsGenerateLogsInputRow
              key={sensorState?.id}
              label="Create sensor logs"
              subtext={`Add logs for ${sensorState?.name ?? sensorState.macAddress}`}
              maximumValue={999}
              minimumValue={-999}
              metric={'temperature'}
              onConfirm={async ({
                min,
                max,
                numLogs,
              }: {
                min: number;
                max: number;
                numLogs: number;
              }) => {
                const sensor = await sensorManager.getSensorByMac(sensorState.macAddress);
                dispatch(DevAction.generateTemperatureLogs(sensor, min, max, numLogs));
              }}
              editDescription={'Add logs'}
              step={0}
            />
          );
        })}
      </SettingsGroup>
    </SettingsList>
  );
};
