import { ActivityIndicator } from 'react-native';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { t } from '~translations';
import { COLOUR, NAVIGATION } from '~constants';
import {
  BreachConfigurationSelector,
  BreachConfigurationAction,
} from '~features/BreachConfiguration';

import { SettingsList } from '~layouts';
import { SettingsGroup, SettingsNavigationRow } from '~components/settings';

const BREACH_DETAIL_SCREEN = NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL;
const CUMULATIVE_DETAIL_SCREEN = NAVIGATION.SCREENS.SETTINGS_STACK.TEMPERATURE_CUMULATIVE_DETAIL;

export const TemperatureBreachSettingsScreen = ({ navigation }) => {
  const hotBreach = useSelector(BreachConfigurationSelector.hotBreachConfig);
  const coldBreach = useSelector(BreachConfigurationSelector.coldBreachConfig);
  const hotCumulative = useSelector(BreachConfigurationSelector.hotCumulativeConfig);
  const coldCumulative = useSelector(BreachConfigurationSelector.coldCumulativeConfig);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BreachConfigurationAction.hydrate());
  }, []);

  return hotBreach ? (
    <SettingsList>
      <SettingsGroup title={t('SINGLE_EXPOSURE_CONFIGS')}>
        <SettingsNavigationRow
          key={hotBreach.id}
          label={hotBreach.description}
          onPress={() => navigation.navigate(BREACH_DETAIL_SCREEN, { id: hotBreach.id })}
        />
        <SettingsNavigationRow
          key={coldBreach.id}
          label={coldBreach.description}
          onPress={() => navigation.navigate(BREACH_DETAIL_SCREEN, { id: coldBreach.id })}
        />
      </SettingsGroup>
      <SettingsGroup title={t('CUMULATIVE_EXPOSURE_CONFIGS')}>
        <SettingsNavigationRow
          key={hotCumulative.id}
          label={hotCumulative.description}
          onPress={() => navigation.navigate(CUMULATIVE_DETAIL_SCREEN, { id: hotCumulative.id })}
        />
        <SettingsNavigationRow
          key={coldCumulative.id}
          label={coldCumulative.description}
          onPress={() => navigation.navigate(CUMULATIVE_DETAIL_SCREEN, { id: coldCumulative.id })}
        />
      </SettingsGroup>
    </SettingsList>
  ) : (
    <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
  );
};
