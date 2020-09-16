import { t } from '~translations';

import { SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';

export const BluetoothSettingsScreen = () => {
  return (
    <SettingsList>
      <SettingsGroup title={t('EDIT_BLUETOOTH_SETTINGS')} />
    </SettingsList>
  );
};
