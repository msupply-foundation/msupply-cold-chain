import { COLOUR } from '~constants';

import { Row } from '~layouts';
import { MsupplyMan } from '~presentation/icons';
import { BatteryStatus } from './BatteryStatus';

const style = { container: { padding: 10, backgroundColor: COLOUR.HIGHLIGHT } };

export const MainHeader = () => (
  <Row style={style.container} justifyContent="space-between">
    <Row flex={3}>
      <MsupplyMan />
    </Row>
    <BatteryStatus />
  </Row>
);
