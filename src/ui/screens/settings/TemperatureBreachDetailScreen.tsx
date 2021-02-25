import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { t } from '../../../common/translations';
import { SettingsList } from '../../layouts';
import { useRouteProps } from '../../hooks';

import {
  SettingsTextInputRow,
  SettingsGroup,
  SettingsNumberInputRow,
} from '../../components/settings';
import { BreachConfigurationAction } from '../../../features/Entities';
import { MILLISECONDS, SETTINGS_STACK } from '../../../common/constants';
import { BreachConfigurationSelector } from '../../../features';
import { SettingsStackParameters } from '../../containers/SettingsStackNavigator';

export const TemperatureBreachDetailScreen: FC = () => {
  const { id } = useRouteProps<SettingsStackParameters, SETTINGS_STACK.SENSOR_DETAIL>();
  const { [id]: config } = useSelector(BreachConfigurationSelector.byId);

  const dispatch = useDispatch();

  const { duration, description, minimumTemperature, maximumTemperature } = config;

  const isHotBreach = id === 'HOT_BREACH';
  const temperature = id === 'HOT_BREACH' ? minimumTemperature : maximumTemperature;

  return (
    <SettingsList>
      <SettingsGroup title={t('EDIT_TEMPERATURE_CONFIGURATION_DETAILS')}>
        <SettingsTextInputRow
          label={t('TEMPERATURE_BREACH_DESCRIPTION')}
          subtext={t('TEMPERATURE_BREACH_DESCRIPTION_SUBTEXT')}
          onConfirm={({ inputValue }: { inputValue: string }) =>
            dispatch(BreachConfigurationAction.update(id, 'description', inputValue))
          }
          value={description}
          editDescription={t('TEMPERATURE_BREACH_DESCRIPTION_EDIT')}
          validation={Yup.string()
            .required(t('REQUIRED'))
            .max(20, t('MAX_CHARACTERS', { number: 20 }))}
        />
        <SettingsNumberInputRow
          label={t('DURATION')}
          subtext={t('DURATION_SUBTEXT')}
          initialValue={duration / (1000 * 60)}
          maximumValue={10 * 60}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
          onConfirm={({ value }: { value: number }) =>
            dispatch(
              BreachConfigurationAction.update(id, 'duration', value * MILLISECONDS.ONE_MINUTE)
            )
          }
          editDescription={t('EDIT_TEMPERATURE_BREACH_DURATION')}
        />
        <SettingsNumberInputRow
          label={t('TEMPERATURE')}
          subtext={isHotBreach ? t('HOT_BREACH_SUBTEXT') : t('COLD_BREACH_SUBTEXT')}
          initialValue={temperature}
          maximumValue={55}
          minimumValue={-30}
          step={1}
          metric={`°${t('CELSIUS')}`}
          onConfirm={({ value }: { value: number }) =>
            dispatch(
              BreachConfigurationAction.update(
                id,
                isHotBreach ? 'minimumTemperature' : 'maximumTemperature',
                value
              )
            )
          }
          editDescription={isHotBreach ? t('HOT_BREACH_SUBTEXT') : t('COLD_BREACH_SUBTEXT')}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
