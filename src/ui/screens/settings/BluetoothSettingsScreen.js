import { useDispatch, useSelector } from 'react-redux';

import { SettingAction } from '~setting';
import { t } from '~translations';
import { SETTING } from '~constants';

import { SettingsNumberInputRow, SettingsGroup } from '~components/settings';
import { SettingsList } from '~layouts';

export const BluetoothSettingsScreen = () => {
  const dispatch = useDispatch();

  const downloadInterval = useSelector(state => state.setting[SETTING.INT.DOWNLOAD_INTERVAL]);

  return (
    <SettingsList>
      <SettingsGroup title={t('EDIT_BLUETOOTH_SETTINGS')}>
        <SettingsNumberInputRow
          label={t('DOWNLOAD_FREQUENCY')}
          subtext={t('DOWNLOAD_FREQUENCY_SUBTEXT')}
          initialValue={downloadInterval / 60000}
          maximumValue={30}
          minimumValue={1}
          step={1}
          metric={t('MINUTES')}
          onConfirm={({ value }) =>
            dispatch(SettingAction.updatedSetting(SETTING.INT.DOWNLOAD_INTERVAL, value * 60000))}
          editDescription={t('EDIT_LOG_INTERVAL')}
        />
      </SettingsGroup>
    </SettingsList>
  );
};
