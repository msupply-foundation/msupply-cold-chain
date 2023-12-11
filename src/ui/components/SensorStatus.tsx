import React, { FC } from 'react';
import { ActivityIndicator } from 'react-native';
import { COLOUR } from '~common/constants';
import { SensorStatusLayout } from '~layouts/SensorStatusLayout';
import { BoldText } from '~presentation/typography';
import { SensorLastDownloadTime } from './SensorLastDownloadTime';
import { SensorTemperatureStatus } from './SensorTemperatureStatus';

interface SensorStatusProps {
  isLoading: boolean;
  hasData: boolean;
  id: string;
  name: string;
}

export const SensorStatus: FC<SensorStatusProps> = ({ isLoading, hasData, id, name }) => {
  const SensorName = <BoldText colour={COLOUR.WHITE}>{name}</BoldText>;

  return isLoading ? (
    <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
  ) : hasData ? (
    <SensorStatusLayout
      TemperatureStatus={<SensorTemperatureStatus id={id} />}
      CumulativeBreach={null}
      LastDownload={<SensorLastDownloadTime id={id} />}
    />
  ) : (
    SensorName
  );
};
