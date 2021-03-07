import React from 'react';
import { COLOUR } from '../../common/constants';
import { SensorStatusLayout } from '../layouts/SensorStatusLayout';
import { BoldText } from '../presentation/typography';
import { SensorListCumulativeBreachStatus } from './SensorListCumulativeBreachStatus';
import { SensorLastDownloadTime } from './SensorLastDownloadTime';
import { SensorStatusBar } from './SensorStatusBar';
import { SensorTemperatureStatus } from './SensorTemperatureStatus';
import { FC } from 'react';

interface SensorStatusProps {
  isLoading: boolean;
  hasData: boolean;
  id: string;
  name: string;
}

export const SensorStatus: FC<SensorStatusProps> = ({ isLoading, hasData, id, name }) => {
  const SensorName = <BoldText colour={COLOUR.WHITE}>{name}</BoldText>;

  return hasData ? (
    <SensorStatusLayout
      isLoading={isLoading}
      SensorStatusBar={<SensorStatusBar id={id} />}
      SensorName={SensorName}
      TemperatureStatus={<SensorTemperatureStatus id={id} />}
      CumulativeBreach={<SensorListCumulativeBreachStatus id={id} />}
      LastDownload={<SensorLastDownloadTime id={id} />}
    />
  ) : (
    SensorName
  );
};