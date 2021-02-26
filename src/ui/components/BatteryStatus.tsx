import React, { FC } from 'react';
import { Icon, ICON_SIZE } from '../presentation/icons';
import { Row } from '../layouts';
import { LargeText, SmallText } from '../presentation/typography';

interface BatteryStatusProps {
  batteryLevel: number;
  isCharging: boolean;
  variant: 'large';
}

export const BatteryStatus: FC<BatteryStatusProps> = ({
  batteryLevel,
  isCharging = false,
  variant = 'large',
}) => {
  const iconSize = variant === 'large' ? ICON_SIZE.L : ICON_SIZE.S;
  const Text = variant === 'large' ? LargeText : SmallText;

  return batteryLevel ? (
    <Row alignItems="center" flex={1}>
      <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} size={iconSize} />
      <Text>{String(batteryLevel)}</Text>
    </Row>
  ) : null;
};
