import React, { FC, ReactNode } from 'react';
import { Row } from '~layouts/Row';
import { Column } from './Column';

interface SensorStatusLayoutProps {
  TemperatureStatus: ReactNode;
  CumulativeBreach: ReactNode;
  LastDownload: ReactNode;
}

export const SensorStatusLayout: FC<SensorStatusLayoutProps> = ({
  TemperatureStatus,
  CumulativeBreach,
  LastDownload,
}) => {
  return (
    <Column flex={1} alignItems="center" justifyContent="center">
      <Row justifyContent="flex-end" style={{ paddingTop: 15 }}>
        {TemperatureStatus}
      </Row>
      <Column alignItems="flex-end">
        {LastDownload}
        {CumulativeBreach}
      </Column>
    </Column>
  );
};
