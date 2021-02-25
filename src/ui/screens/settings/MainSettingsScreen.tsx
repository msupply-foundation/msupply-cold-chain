import React, { FC, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';

import { SettingsList } from '../../layouts';
import { COLOUR, SETTINGS_STACK } from '../../../common/constants';
import { t } from '../../../common/translations';
import { Chevron } from '../../presentation/icons';
import { SettingsGroup, SettingsItem } from '../../components/settings';
import { SettingAction } from '../../../features/Entities';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';

const ChevronIcon = <Chevron direction="right" colour={COLOUR.GREY_ONE} />;

type MainSettingsScreenProps = {
  navigation: StackNavigationProp<SettingsStackParameters, SETTINGS_STACK.MENU>;
};

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
          label="Developer settings"
          subtext="Assortment of options useful for development"
          onPress={() => navigation.navigate(SETTINGS_STACK.DEVELOPER)}
          RightComponent={ChevronIcon}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
