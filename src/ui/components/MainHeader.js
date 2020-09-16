import { useBatteryLevel, usePowerState } from 'react-native-device-info';
import { COLOUR } from '~constants';

import { Row } from '~layouts';
import { MsupplyMan } from '~presentation/icons';
import { BatteryStatus } from '~presentation/BatteryStatus';
import { withFormatService } from '../hoc/withFormatService';
import { useTime } from '../hooks/useTime';
import { DateAndTime } from '../presentation/DateAndTime';

const style = { container: { padding: 10, backgroundColor: COLOUR.HIGHLIGHT } };

export const MainHeader = withFormatService(({ formatter }) => {
  const batteryLevel = useBatteryLevel();
  const isCharging = usePowerState();
  const timeNow = useTime();

  return (
    <Row style={style.container} justifyContent="space-between">
      <Row flex={3}>
        <MsupplyMan />
      </Row>
      <Row flex={1} justifyContent="space-between">
        <BatteryStatus
          batteryLevel={formatter.batteryLevel(batteryLevel)}
          isCharging={isCharging}
        />
        <DateAndTime date={formatter.headerDate(timeNow)} time={formatter.headerTime(timeNow)} />
      </Row>
    </Row>
  );
});
