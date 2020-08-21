import { HalfCircleButton } from '~components/buttons';
import { Chevron } from '~presentation/icons';

import { STYLE } from '~constants';

import { Column } from './Column';
import { FlexPaddingView } from './FlexPaddingView';
import { Row } from './Row';

const styles = {
  row: {
    maxHeight: STYLE.HEIGHT.SENSOR_ROW,
    paddingVertical: STYLE.PADDING.VERTICAL,
    width: '100%',
  },
};

export const SensorRowLayout = ({ Chart, SensorStatus, SensorName, direction }) => {
  return (
    <Row justifyContent="space-between" alignItems="center" style={styles.row}>
      {direction === 'left' && (
        <HalfCircleButton direction={direction} Icon={<Chevron direction={direction} />} />
      )}
      {Chart}
      <Column>
        {SensorName}
        {SensorStatus}
        <FlexPaddingView height={35} />
      </Column>
      {direction === 'right' && (
        <HalfCircleButton direction={direction} Icon={<Chevron direction={direction} />} />
      )}
    </Row>
  );
};
