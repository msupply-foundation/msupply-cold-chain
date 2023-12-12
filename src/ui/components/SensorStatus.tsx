import React, { FC } from 'react';
import { ActivityIndicator } from 'react-native';
import { COLOUR } from '~common/constants';
import { SensorStatusLayout } from '~layouts/SensorStatusLayout';
import { SensorLastDownloadTime } from './SensorLastDownloadTime';
import { SensorTemperatureStatus } from './SensorTemperatureStatus';

interface SensorStatusProps {
  isLoading: boolean;
  hasData: boolean;
  id: string;
}

export const SensorStatus: FC<SensorStatusProps> = ({ isLoading, hasData, id }) => {
  return isLoading ? (
    <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
  ) : hasData ? (
    <SensorStatusLayout
      TemperatureStatus={<SensorTemperatureStatus id={id} />}
      CumulativeBreach={null}
      LastDownload={<SensorLastDownloadTime id={id} />}
    />
  ) : null;
};
