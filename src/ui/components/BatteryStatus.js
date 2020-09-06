import { useBatteryLevel, usePowerState } from 'react-native-device-info';
import { Battery } from '../presentation/icons/Battery';
import { Row } from '../layouts';
import { LargeText } from '../presentation/typography';

export const BatteryStatus = () => {
  const batteryLevel = useBatteryLevel();
  const isCharging = usePowerState() === 'charging';

  return batteryLevel ? (
    <Row justifyContent="space-evenly" alignItems="center" flex={1}>
      <Battery isCharging={isCharging} batteryLevel={Number(batteryLevel * 100).toFixed()} />
      <LargeText>{Number(batteryLevel * 100).toFixed()}</LargeText>
    </Row>
  ) : null;
};
