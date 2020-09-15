import { COLOUR } from '~constants';

import { Row } from '~layouts';
import { MsupplyMan } from '~presentation/icons';
import { useTime } from '../hooks/useTime';
import { DateAndTime } from '../presentation/DateAndTime';
import { BatteryStatus } from './BatteryStatus';

const style = { container: { padding: 10, backgroundColor: COLOUR.HIGHLIGHT } };

export const MainHeader = () => {
  const time = useTime();
  return (
    <Row style={style.container}>
      <Row flex={2}>
        <MsupplyMan />
      </Row>
      <BatteryStatus />
      <Row style={{}}>
        <DateAndTime date={time} />
      </Row>
    </Row>
  );
};
