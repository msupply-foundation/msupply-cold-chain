import React, { FC } from 'react';
import { View } from 'react-native';
import { usePowerState } from 'react-native-device-info';
import { COLOUR } from '~constants';
import { Row } from '~layouts';
import { Icon } from '~presentation/icons';
import { BatteryStatus } from './BatteryStatus';
import { DateAndTime } from '~presentation/DateAndTime';
import { useTime, useFormatter } from '~hooks';

const style = { container: { padding: 10, backgroundColor: COLOUR.HIGHLIGHT } };

export const MainHeader: FC = () => {
  const formatter = useFormatter();
  const { batteryLevel = 0, batteryState } = usePowerState();

  const isCharging = batteryState === 'charging';
  const timeNow = useTime();

  return (
    <Row style={style.container} justifyContent="space-between">
      <Icon.MsupplyMan />

      <Row>
        <BatteryStatus batteryLevel={Math.ceil(batteryLevel * 100)} isCharging={isCharging} />
        <View style={{ width: 20 }} />
        <DateAndTime
          date={formatter.headerDate(timeNow.toDate())}
          time={formatter.headerTime(timeNow.toDate())}
        />
      </Row>
    </Row>
  );
};
