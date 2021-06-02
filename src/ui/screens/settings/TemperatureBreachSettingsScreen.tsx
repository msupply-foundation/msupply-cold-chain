import { ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { t } from '~translations';
import { COLOUR, SETTINGS_STACK } from '~constants';
import { BreachConfigurationSelector, BreachConfigurationAction } from '~features/Entities';
import { SettingsList } from '~layouts';
import { SettingsGroup, SettingsNavigationRow } from '~components/settings';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';
import { useFormatter } from '~hooks';
import { LoadAfterInteractions } from '~components';

const BREACH_DETAIL_SCREEN = SETTINGS_STACK.TEMPERATURE_BREACH_DETAIL;
const CUMULATIVE_DETAIL_SCREEN = SETTINGS_STACK.TEMPERATURE_CUMULATIVE_DETAIL;

type TemperatureBreachSettingsScreenProps = {
  navigation: StackNavigationProp<SettingsStackParameters, SETTINGS_STACK.MENU>;
};

export const TemperatureBreachSettingsScreen: FC<TemperatureBreachSettingsScreenProps> = ({
  navigation,
}) => {
  const formatter = useFormatter();

  const hotBreach = useSelector(BreachConfigurationSelector.hotBreachConfig);
  const coldBreach = useSelector(BreachConfigurationSelector.coldBreachConfig);
  const hotCumulative = useSelector(BreachConfigurationSelector.hotCumulativeConfig);
  const coldCumulative = useSelector(BreachConfigurationSelector.coldCumulativeConfig);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BreachConfigurationAction.fetchAll());
  }, [dispatch]);

  return (
    <LoadAfterInteractions Loading={null}>
      {hotBreach ? (
        <SettingsList>
          <SettingsGroup title={t('SINGLE_EXPOSURE_CONFIGS')}>
            <SettingsNavigationRow
              Icon={null}
              subtext={formatter.breachConfigRow(hotBreach)}
              key={hotBreach.id}
              label={hotBreach.description}
              onPress={() => navigation.navigate(BREACH_DETAIL_SCREEN, { id: hotBreach.id })}
            />
            <SettingsNavigationRow
              Icon={null}
              subtext={formatter.breachConfigRow(coldBreach)}
              key={coldBreach.id}
              label={coldBreach.description}
              onPress={() => navigation.navigate(BREACH_DETAIL_SCREEN, { id: coldBreach.id })}
            />
          </SettingsGroup>
          <SettingsGroup title={t('CUMULATIVE_EXPOSURE_CONFIGS')}>
            <SettingsNavigationRow
              Icon={null}
              subtext={formatter.breachConfigRow(hotCumulative)}
              key={hotCumulative.id}
              label={hotCumulative.description}
              onPress={() =>
                navigation.navigate(CUMULATIVE_DETAIL_SCREEN, { id: hotCumulative.id })
              }
            />
            <SettingsNavigationRow
              Icon={null}
              subtext={formatter.breachConfigRow(coldCumulative)}
              key={coldCumulative.id}
              label={coldCumulative.description}
              onPress={() =>
                navigation.navigate(CUMULATIVE_DETAIL_SCREEN, { id: coldCumulative.id })
              }
            />
          </SettingsGroup>
        </SettingsList>
      ) : null}
    </LoadAfterInteractions>
  );
};
