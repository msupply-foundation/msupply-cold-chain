import { SettingsList } from '~layouts';
import { COLOUR, NAVIGATION } from '~constants';
import { t } from '~translations';
import { Chevron } from '~presentation/icons';
import { SettingsGroup, SettingsItem } from '~components/settings';

const ChevronIcon = <Chevron direction="right" colour={COLOUR.GREY_ONE} />;

export const MainSettingsScreen = ({ navigation }) => {
  console.log('re-render main settings screen');
  return (
    <SettingsList>
      <SettingsGroup title={t('OPTIONS')}>
        {/* <SettingsItem
          label={t('BLUETOOTH_SETTINGS')}
          subtext={t('BLUETOOTH_SETTINGS_SUBTEXT')}
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.BLUETOOTH)}
          RightComponent={ChevronIcon}
        /> */}
        <SettingsItem
          label={t('SENSOR_SETTINGS')}
          subtext={t('SENSOR_SETTINGS_SUBTEXT')}
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.SENSORS)}
          RightComponent={ChevronIcon}
        />
        <SettingsItem
          label={t('TEMPERATURE_BREACH_SETTINGS')}
          subtext={t('TEMPERATURE_BREACH_SETTINGS_SUBTEXT')}
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH)}
          RightComponent={ChevronIcon}
        />

        <SettingsItem
          label="Developer settings"
          subtext="Assortment of options useful for development"
          onPress={() => navigation.navigate(NAVIGATION.SCREENS.SETTINGS_STACK.DEVELOPER)}
          RightComponent={ChevronIcon}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
