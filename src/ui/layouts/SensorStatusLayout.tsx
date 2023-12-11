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
    <Column flex={1} style={{ minWidth: 175 }}>
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
