import { View } from 'react-native';
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
  chartContainer: {
    minHeight: STYLE.HEIGHT.NORMAL_CHART,
    minWidth: STYLE.WIDTH.NORMAL_CHART,
  },
};

export const SensorRowLayout = ({
  Chart,
  SensorStatus,
  SensorName,
  direction,
  Extra = <FlexPaddingView height={35} />,
}) => {
  return (
    <Row justifyContent="space-between" alignItems="center" style={styles.row}>
      {direction === 'left' && (
        <HalfCircleButton direction={direction} Icon={<Chevron direction={direction} />} />
      )}
      <View style={{}}>{Chart}</View>
      <Column>
        {SensorName}
        {SensorStatus}
        {Extra}
      </Column>
      {direction === 'right' && (
        <HalfCircleButton direction={direction} Icon={<Chevron direction={direction} />} />
      )}
    </Row>
  );
};
