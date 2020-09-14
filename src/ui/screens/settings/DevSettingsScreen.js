import { useDispatch, useSelector } from 'react-redux';

import { SensorAction, SensorSelector } from '~features/Entities';

import { SettingsButtonRow, SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';

const randomMacAddress = () => {
  return 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => {
    return '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16));
  });
};

export const DevSettingsScreen = () => {
  const dispatch = useDispatch();
  const availableSensors = useSelector(SensorSelector.sensorsList);

  return (
    <SettingsList>
      <SettingsGroup title="Add records">
        <SettingsButtonRow
          label="Add random sensor"
          subtext="Adds a random sensor with a random mac address and default values"
          onPress={() => dispatch(SensorAction.create(randomMacAddress(), 300))}
        />
        {availableSensors.map(sensor => (
          <SettingsButtonRow
            key={sensor?.id}
            label={`Add logs for ${sensor?.name ?? sensor.macAddress}`}
            // onPress={() => dispatch(TemperatureLogActions.addRandomLogs(sensor.id))}
          />
        ))}
      </SettingsGroup>
    </SettingsList>
  );
};
