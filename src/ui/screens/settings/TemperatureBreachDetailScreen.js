import { t } from '~translations';
import { SettingsList } from '~layouts';

import { SettingsGroup, SettingsNumberInputRow } from '~components/settings';

const mockTemperatureBreachConfiguration = {
  duration: 1000 * 60 * 30,
  minimumTemperature: 8,
  maximumTemperature: 999,
};

export const TemperatureBreachDetailScreen = ({ config = mockTemperatureBreachConfiguration }) => {
  return (
    <SettingsList>
      <SettingsGroup title={t('EDIT_TEMPERATURE_CONFIGURATION_DETAILS')}>
        <SettingsNumberInputRow
          label={t('DURATION')}
          subtext={t('DURATION_SUBTEXT')}
          sliderValue={config.duration / (1000 * 60)}
          maximumValue={120}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
          onConfirm={e => e}
          editDescription={t('EDIT_TEMPERATURE_BREACH_DURATION')}
        />
        <SettingsNumberInputRow
          label={t('TEMPERATURE_RANGE')}
          subtext={t('TEMPERATURE_RANGE_SUBTEXT')}
          sliderValue={config.minimumTemperature}
          maximumValue={100}
          minimumValue={1}
          step={1}
          metric={`°${t('CELSIUS')}`}
          onConfirm={e => e}
          editDescription={t('TEMPERATURE_RANGE_SUBTEXT')}
          pickerValue="+"
          pickerOptions={[
            { label: t('AND_ABOVE'), value: '+' },
            { label: t('AND_BELOW'), value: '-' },
          ]}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
