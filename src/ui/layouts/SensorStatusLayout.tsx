import React, { FC, ReactNode } from 'react';
import { Row } from '~layouts/Row';
import { Column } from './Column';

interface SensorStatusLayoutProps {
  SensorName: ReactNode;
  TemperatureStatus: ReactNode;
  SensorStatusBar: ReactNode;
  CumulativeBreach: ReactNode;
  LastDownload: ReactNode;
}

export const SensorStatusLayout: FC<SensorStatusLayoutProps> = ({
  SensorName,
  TemperatureStatus,
  SensorStatusBar,
  CumulativeBreach,
  LastDownload,
}) => {
  return (
    <Column flex={1}>
      <Row justifyContent="space-between" alignItems="flex-end" flex={1}>
        {SensorName}
        <Row style={{ marginLeft: 5 }} />
        {SensorStatusBar}
      </Row>
      <Row justifyContent="flex-end" style={{ paddingRight: 20 }}>
        {TemperatureStatus}
      </Row>
      <Column flex={1} alignItems="flex-end" style={{ paddingRight: 25 }}>
        {LastDownload}
        {CumulativeBreach}
      </Column>
    </Column>
  );
};
