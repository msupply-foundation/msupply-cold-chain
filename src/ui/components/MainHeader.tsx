import React, { FC } from 'react';
import { View } from 'react-native';

import { COLOUR } from '~constants';
import { Row } from '~layouts';
import { Icon } from '~presentation/icons';
import { BatteryStatus } from './BatteryStatus';
import { DateAndTime } from '~presentation/DateAndTime';
import { useTime, useFormatter, usePowerState } from '~hooks';

const style = { container: { paddingHorizontal: 10, backgroundColor: COLOUR.HIGHLIGHT } };

export const MainHeader: FC = () => {
  const formatter = useFormatter();
  const { batteryLevel, isCharging } = usePowerState();
  const timeNow = useTime();

  return (
    <Row style={style.container} alignItems="center" justifyContent="space-between">
      <Icon.MsupplyMan />

      <Row>
        <BatteryStatus batteryLevel={batteryLevel} isCharging={isCharging} />
        <View style={{ width: 20 }} />
        <DateAndTime date={formatter.headerDate(timeNow)} time={formatter.headerTime(timeNow)} />
      </Row>
    </Row>
  );
};
