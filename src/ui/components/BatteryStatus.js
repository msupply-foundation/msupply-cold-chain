import { useBatteryLevel, usePowerState } from 'react-native-device-info';

import { Battery } from '../presentation/icons';
import { Row } from '../layouts';
import { LargeText } from '../presentation/typography';

export const BatteryStatus = () => {
  const batteryLevel = useBatteryLevel();
  const isCharging = usePowerState() === 'charging';

  console.log('-------------------------------------------');
  console.log('batteryLevel', batteryLevel);
  console.log('isCharging', isCharging);
  console.log('-------------------------------------------');

  return batteryLevel ? (
    <Row justifyContent="space-evenly" flex={1}>
      <Battery isCharging={isCharging} batteryLevel={Number(batteryLevel * 100).toFixed()} />
      <LargeText>{`${Number(batteryLevel * 100).toFixed()}%`}</LargeText>
    </Row>
  ) : null;
};
