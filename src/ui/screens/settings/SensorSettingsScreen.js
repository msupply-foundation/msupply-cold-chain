import { ActivityIndicator } from 'react-native';

import { t } from '~translations';
import { SettingsGroup, SettingsItem, SettingsNavigationRow } from '~components/settings';
import { Column, SettingsList } from '~layouts';
import { COLOUR, NAVIGATION } from '~constants';

export const SensorSettingsScreen = ({ navigation }) => {
  return (
    <SettingsList>
      <SettingsItem label={t('SCAN_FOR_SENSORS')} onPress={() => {}} />
      <SettingsGroup title="Available sensors">
        <SettingsNavigationRow
          label="Sensor one"
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.SENSOR_DETAIL)}
        />
        <SettingsNavigationRow
          label="Sensor two"
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.SENSOR_DETAIL)}
        />
        <SettingsNavigationRow
          label="Sensor three"
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.SENSOR_DETAIL)}
        />
      </SettingsGroup>
      <SettingsGroup title="Found sensors">
        <Column style={{ height: 300 }} flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={COLOUR.SECONDARY} />
        </Column>
      </SettingsGroup>
    </SettingsList>
  );
};
