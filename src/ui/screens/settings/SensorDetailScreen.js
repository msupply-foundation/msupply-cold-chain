import * as Yup from 'yup';

import { t } from '~translations';
import { SettingsList } from '~layouts';

import {
  SettingsTextInputRow,
  SettingsGroup,
  SettingsSwitchRow,
  SettingsDateRow,
  SettingsNumberInputRow,
} from '~components/settings';

const mockSensor = { name: 'Sensor 1', logInterval: 300, logDelay: null };

export const SensorDetailScreen = ({ sensor = mockSensor }) => {
  const { name, logInterval } = sensor;
  return (
    <SettingsList>
      <SettingsGroup title={t('EDIT_SENSOR_DETAILS')}>
        <SettingsTextInputRow
          label={t('SENSOR_NAME')}
          subtext={t('SENSOR_NAME_SUBTEXT')}
          value={name}
          validation={Yup.string()
            .required(t('REQUIRED'))
            .max(20, t('MAX_CHARACTERS', { number: 20 }))}
          onConfirm={e => e}
          editDescription={t('EDIT_SENSOR_NAME')}
        />
        <SettingsNumberInputRow
          label={t('LOG_INTERVAL')}
          subtext={t('LOG_INTERVAL_SUBTEXT')}
          sliderValue={logInterval / 60}
          maximumValue={30}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
          onConfirm={e => e}
          editDescription={t('EDIT_LOG_INTERVAL')}
        />

        <SettingsDateRow label="Delay logging until.." subtext="10am" />
      </SettingsGroup>
      <SettingsGroup title="Available breach configurations">
        <SettingsSwitchRow
          label="Breach config 1"
          subtext="Minimum temp: 2, maxmium temp: 8, duration: 30 minutes"
          isOn
        />
      </SettingsGroup>
    </SettingsList>
  );
};
