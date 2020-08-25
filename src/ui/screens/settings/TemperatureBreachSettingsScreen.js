import { useSelector } from 'react-redux';

import { SettingsList } from '~layouts';
import { NAVIGATION } from '~constants';

import { SettingsNavigationRow } from '~components/settings';

export const TemperatureBreachSettingsScreen = ({ navigation }) => {
  const configs = useSelector(({ breachConfiguration }) => {
    const { byId, ids } = breachConfiguration;
    return ids.map(id => byId[id]);
  });

  return (
    <SettingsList>
      {configs.map(({ id, description }) => (
        <SettingsNavigationRow
          label={description}
          onPress={() =>
            navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL, { id })}
        />
      ))}
    </SettingsList>
  );
};
