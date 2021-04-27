import React, { FC } from 'react';
import { View } from 'react-native';
import { usePowerState } from 'react-native-device-info';
import { COLOUR } from '../../common/constants';

import { Row } from '../layouts';
import { Icon } from '../presentation/icons';
import { BatteryStatus } from './BatteryStatus';
import { withFormatService } from '../hoc/withFormatService';
import { useTime } from '../hooks/useTime';
import { DateAndTime } from '../presentation/DateAndTime';
import { FormatService } from '../../common/services';

const style = { container: { padding: 10, backgroundColor: COLOUR.HIGHLIGHT } };

interface MainHeaderProps {
  formatter: FormatService;
}

export const MainHeader: FC = withFormatService(({ formatter }: MainHeaderProps) => {
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
});
