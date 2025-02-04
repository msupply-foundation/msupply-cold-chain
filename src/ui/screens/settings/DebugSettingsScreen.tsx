import React, { FC, useEffect, useState } from 'react';
import { LogLevel as FileLogLevel } from 'react-native-file-logger';
import { SettingsButtonRow, SettingsGroup, SettingsSwitchRow } from '~components/settings';
import { useDispatch } from 'react-redux';
import { SettingsList } from '~layouts';
import { useDependency } from '~hooks';
import { DEPENDENCY } from '~constants';
import { FileLoggerService } from '~common/services';
import { SettingsSelectRow } from '~components/settings/SettingsSelectRow';
import { SettingAction } from '../../../features/Entities';
import { ENVIRONMENT } from '~common/constants';
import { logLevelFromString } from '~common/services/UtilService';

const toValue = (level: FileLogLevel) => {
  switch (level) {
    case FileLogLevel.Debug:
      return 'debug';
    case FileLogLevel.Info:
      return 'info';
    case FileLogLevel.Warning:
      return 'warn';
    case FileLogLevel.Error:
      return 'error';
  }
};

export const DebugSettingsScreen: FC = () => {
  const loggerService: FileLoggerService = useDependency(
    DEPENDENCY.LOGGER_SERVICE
  ) as FileLoggerService;

  const [enabled, setEnabled] = useState(loggerService.enabled);
  const dispatch = useDispatch();
  const [captureConsole, setCaptureConsole] = useState(loggerService.captureConsole);
  const [logLevel, setLogLevel] = useState(toValue(loggerService.logLevel));
  const options = [
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    { label: 'Warn', value: 'warn' },
    { label: 'Error', value: 'error' },
  ];

  useEffect(() => {
    loggerService.enabled = enabled;
  }, [loggerService, enabled]);

  useEffect(() => {
    loggerService.setLogLevel(logLevelFromString(logLevel));
  }, [loggerService, logLevel]);

  useEffect(() => {
    loggerService.setCaptureConsole(captureConsole);
  }, [loggerService, captureConsole]);

  return (
    <SettingsList>
      <SettingsGroup title="Debug logging">
        <SettingsSwitchRow
          label="Enable"
          subtext="Enable logging of events to a log file. Logs are rotated at least daily, with a maximum of 5 logs."
          isOn={enabled}
          onPress={() => {
            dispatch(SettingAction.update('debugLogEnabled', !enabled));
            setEnabled(!enabled);
          }}
          isDisabled={!!ENVIRONMENT.DEV_LOGGER}
        />
      </SettingsGroup>
      {enabled && (
        <>
          <SettingsSelectRow
            label="Logging Level"
            options={options}
            onChange={(value, _index) => {
              dispatch(SettingAction.update('logLevel', value));
              setLogLevel(value);
            }}
            value={logLevel}
          />
          <SettingsSwitchRow
            label="Capture console logs"
            subtext="Writes all console log entries to the log file, use only if you are having real trouble"
            isOn={captureConsole}
            onPress={() => setCaptureConsole(!captureConsole)}
          />
          <SettingsButtonRow
            subtext="Click to email a copy of the latest log files"
            label="Send logs"
            onPress={() => loggerService.emailLogFiles({})}
          />
        </>
      )}
    </SettingsList>
  );
};
