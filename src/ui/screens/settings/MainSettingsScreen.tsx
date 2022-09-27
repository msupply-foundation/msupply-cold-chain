import React, { FC, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';

import { SettingsList } from '~layouts';
import { COLOUR, SETTINGS_STACK } from '~constants';
import { t } from '~translations';
import { Icon } from '~presentation/icons';
import { SettingsGroup, SettingsItem } from '~components/settings';
import { SettingAction } from '~features/Entities';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';
import { useUtils } from '~hooks';

const ChevronIcon = <Icon.Chevron direction="right" color={COLOUR.GREY_ONE} />;

interface MainSettingsScreenProps {
  navigation: StackNavigationProp<SettingsStackParameters, SETTINGS_STACK.MENU>;
}

export const MainSettingsScreen: FC<MainSettingsScreenProps> = ({ navigation }) => {
  const utils = useUtils();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SettingAction.fetchAll());
  }, [dispatch]);

  return (
    <SettingsList>
      <SettingsGroup title={t('OPTIONS')}>
        <SettingsItem
          label={t('SENSOR_SETTINGS')}
          subtext={t('SENSOR_SETTINGS_SUBTEXT')}
          onPress={() => navigation.navigate(SETTINGS_STACK.SENSORS)}
          RightComponent={ChevronIcon}
        />
        <SettingsItem
          label={t('TEMPERATURE_BREACH_SETTINGS')}
          subtext={t('TEMPERATURE_BREACH_SETTINGS_SUBTEXT')}
          onPress={() => navigation.navigate(SETTINGS_STACK.TEMPERATURE_BREACH)}
          RightComponent={ChevronIcon}
        />

        <SettingsItem
          label={t('SYNC_SETTINGS')}
          subtext={t('SYNC_CONFIGURATION')}
          onPress={() => navigation.navigate(SETTINGS_STACK.SYNC)}
          RightComponent={ChevronIcon}
        />
        <SettingsItem
          label={t('DEBUG_SETTINGS')}
          subtext={t('DEBUG_CONFIGURATION')}
          onPress={() => navigation.navigate(SETTINGS_STACK.DEBUG)}
          RightComponent={ChevronIcon}
        />

        {__DEV__ && (
          <SettingsItem
            label="Developer settings"
            subtext="Assortment of options useful for development"
            onPress={() => navigation.navigate(SETTINGS_STACK.DEVELOPER)}
            RightComponent={ChevronIcon}
          />
        )}
      </SettingsGroup>

      <SettingsGroup title={t('ABOUT_THIS_APP')}>
        <SettingsItem label={t('APP_VERSION')} subtext={utils.appVersion()} />
      </SettingsGroup>
    </SettingsList>
  );
};
