import { View } from 'react-native';

import { Icon } from './icons';
import { LargeText } from './typography';

export const BatteryStatus = ({ batteryLevel, isCharging }) => {
  return (
    <>
      <View style={{ marginLeft: 10 }}>
        <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} />
      </View>
      <LargeText>{batteryLevel}</LargeText>
    </>
  );
};
