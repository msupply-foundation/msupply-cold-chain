import React, { FC } from 'react';
import { Icon, ICON_SIZE } from '../presentation/icons';
import { Row } from '../layouts';
import { MediumText, SmallText } from '../presentation/typography';
import { t } from '~common/translations';
import { COLOUR } from '~constants';

interface BatteryStatusProps {
  batteryLevel: number | undefined;
  isCharging?: boolean;
  variant?: 'large' | 'small';
}

export const BatteryStatus: FC<BatteryStatusProps> = ({
  batteryLevel,
  isCharging = false,
  variant = 'large',
}) => {
  const iconSize = variant === 'large' ? ICON_SIZE.MS : ICON_SIZE.S;
  const Text = variant === 'large' ? MediumText : SmallText;

  if (typeof batteryLevel === 'undefined') {
    return null;
  }
  return batteryLevel ? (
    <Row alignItems="center">
      <Text color={COLOUR.WHITE}>{String(batteryLevel)}</Text>
      <Row style={{ marginLeft: 5 }} />
      <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} size={iconSize} />
    </Row>
  ) : (
    <Row alignItems="center">
      <Text color={COLOUR.WHITE}>{t('NOT_AVAILABLE')}</Text>
      <Row style={{ marginLeft: 5 }} />
      {<Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} size={iconSize} />}
    </Row>
  );
};
