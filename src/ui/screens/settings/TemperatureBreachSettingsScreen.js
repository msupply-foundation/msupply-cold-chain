import { SettingsList } from '~layouts';
import { SettingsNavigationRow } from '../../components/settings';
import { NAVIGATION } from '../../../shared/constants';

export const TemperatureBreachSettingsScreen = ({ navigation }) => {
  return (
    <SettingsList>
      <SettingsNavigationRow
        label="Config 1"
        onPress={() =>
          navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL)}
      />
    </SettingsList>
  );
};
