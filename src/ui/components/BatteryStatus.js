import { Icon } from '../presentation/icons';
import { Row } from '../layouts';
import { LargeText, SmallText } from '../presentation/typography';

export const BatteryStatus = ({ batteryLevel, isCharging, variant = 'large' }) => {
  const iconSize = variant === 'large' ? 50 : 10;
  const Text = variant === 'large' ? LargeText : SmallText;

  return batteryLevel ? (
    <Row alignItems="center" flex={1}>
      <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} size={iconSize} />
      <Text>{batteryLevel}</Text>
    </Row>
  ) : null;
};
