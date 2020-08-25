import { useDispatch } from 'react-redux';

import { SensorAction } from '~sensor';

import { SettingsButtonRow, SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';

const randomMacAddress = () => {
  return 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => {
    return '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16));
  });
};

export const DevSettingsScreen = () => {
  const dispatch = useDispatch();

  return (
    <SettingsList>
      <SettingsGroup title="Add records">
        <SettingsButtonRow
          label="Add random sensor"
          subtext="Adds a random sensor with a random mac address and default values"
          onPress={() => dispatch(SensorAction.addNewSensor(randomMacAddress(), 300))}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
