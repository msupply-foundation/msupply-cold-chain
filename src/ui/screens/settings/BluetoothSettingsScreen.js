import { t } from '~translations';

import { SettingsNumberInputRow, SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';

export const BluetoothSettingsScreen = () => {
  return (
    <SettingsList>
      <SettingsGroup title={t('EDIT_BLUETOOTH_SETTINGS')}>
        <SettingsNumberInputRow
          label={t('DOWNLOAD_FREQUENCY')}
          subtext={t('DOWNLOAD_FREQUENCY_SUBTEXT')}
          sliderValue={10}
          maximumValue={30}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
          onConfirm={e => e}
          editDescription={t('EDIT_LOG_INTERVAL')}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
