import React, { FC } from 'react';
import { Icon, ICON_SIZE } from '../presentation/icons';
import { Row } from '../layouts';
import { LargeText, SmallText } from '../presentation/typography';
import { t } from '~common/translations';

interface BatteryStatusProps {
  batteryLevel: number;
  isCharging?: boolean;
  variant?: 'large' | 'small';
}

export const BatteryStatus: FC<BatteryStatusProps> = ({
  batteryLevel,
  isCharging = false,
  variant = 'large',
}) => {
  const iconSize = variant === 'large' ? ICON_SIZE.L : ICON_SIZE.S;
  const Text = variant === 'large' ? LargeText : SmallText;

  return batteryLevel ? (
    <Row alignItems="center">
      <Text>{String(batteryLevel)}</Text>
      <Row style={{ marginLeft: 5 }} />
      <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} size={iconSize} />
    </Row>
  ) : (
    <Row>
      <Text>{t('NOT_AVAILABLE')}</Text>
      <Row style={{ marginLeft: 10 }} />
      <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} size={iconSize} />
    </Row>
  );
};
