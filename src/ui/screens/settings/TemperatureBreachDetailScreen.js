import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { t } from '~translations';
import { SettingsList } from '~layouts';
import { useRouteProps } from '~hooks';

import { SettingsTextInputRow, SettingsGroup, SettingsNumberInputRow } from '~components/settings';
import { BreachConfigurationAction } from '~features/Entities';
import { MILLISECONDS } from '../../../common/constants';

export const TemperatureBreachDetailScreen = () => {
  const { id } = useRouteProps();
  const config = useSelector(({ breachConfiguration }) => {
    const { byId } = breachConfiguration;
    return byId[id];
  });

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
          onConfirm={({ inputValue }) =>
            dispatch(BreachConfigurationAction.update(id, 'description', inputValue))}
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
          onConfirm={({ value }) =>
            dispatch(
              BreachConfigurationAction.update(id, 'duration', value * MILLISECONDS.ONE_MINUTE)
            )}
          editDescription={t('EDIT_TEMPERATURE_BREACH_DURATION')}
        />
        <SettingsNumberInputRow
          label={t('TEMPERATURE')}
          subtext={isHotBreach ? t('HOT_BREACH_SUBTEXT') : t('COLD_BREACH_SUBTEXT')}
          initialValue={temperature}
          maximumValue={50}
          minimumValue={1}
          step={1}
          metric={`°${t('CELSIUS')}`}
          onConfirm={({ value }) =>
            dispatch(
              BreachConfigurationAction.update(
                id,
                isHotBreach ? 'minimumTemperature' : 'maximumTemperature',
                value
              )
            )}
          editDescription={isHotBreach ? t('HOT_BREACH_SUBTEXT') : t('COLD_BREACH_SUBTEXT')}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
