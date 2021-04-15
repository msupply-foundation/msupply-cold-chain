import React, { FC, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';

import { SettingsList } from '../../layouts';
import { COLOUR, SETTINGS_STACK } from '../../../common/constants';
import { t } from '../../../common/translations';
import { Icon } from '../../presentation/icons';
import { SettingsGroup, SettingsItem } from '../../components/settings';
import { SettingAction } from '../../../features/Entities';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';

const ChevronIcon = <Icon.Chevron direction="right" color={COLOUR.GREY_ONE} />;

interface MainSettingsScreenProps {
  navigation: StackNavigationProp<SettingsStackParameters, SETTINGS_STACK.MENU>;
}

export const MainSettingsScreen: FC<MainSettingsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SettingAction.fetchAll());
  }, []);

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
          label="Sync settings"
          subtext="Sync configuration"
          onPress={() => navigation.navigate(SETTINGS_STACK.SYNC)}
          RightComponent={ChevronIcon}
        />
        <SettingsItem
          label="Developer settings"
          subtext="Assortment of options useful for development"
          onPress={() => navigation.navigate(SETTINGS_STACK.DEVELOPER)}
          RightComponent={ChevronIcon}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
