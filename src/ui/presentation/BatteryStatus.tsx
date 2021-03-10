import React, { FC } from 'react';
import { View } from 'react-native';

import { Icon } from './icons';
import { LargeText } from './typography';

interface BatteryStatusProps {
  batteryLevel: number;
  isCharging: boolean;
}

export const BatteryStatus: FC<BatteryStatusProps> = ({ batteryLevel, isCharging }) => {
  return (
    <>
      <View style={{ marginLeft: 10 }}>
        <Icon.Battery isCharging={isCharging} batteryLevel={batteryLevel} />
      </View>
      <LargeText>{String(batteryLevel)}</LargeText>
    </>
  );
};
