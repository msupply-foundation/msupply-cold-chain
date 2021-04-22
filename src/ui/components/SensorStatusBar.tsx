import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/store/store';
import { SensorSelector } from '../../features';
import { Row } from '../layouts';
import { BatteryStatus } from './BatteryStatus';

interface SensorStatusBarProps {
  id: string;
}

export const SensorStatusBar: FC<SensorStatusBarProps> = ({ id }) => {
  const batteryLevel = useSelector((state: RootState) =>
    SensorSelector.getBatteryLevel(state, { id })
  );

  return (
    <Row alignItems="center" style={{ alignSelf: 'flex-start' }}>
      <BatteryStatus batteryLevel={batteryLevel} variant="small" />
    </Row>
  );
};
