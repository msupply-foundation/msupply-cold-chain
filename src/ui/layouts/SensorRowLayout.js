import { TouchableOpacity } from 'react-native';

import { STYLE } from '~constants';

import { Column } from './Column';
import { Row } from './Row';
import { HalfCircleButton } from '~components/buttons';
import { Chevron } from '~presentation/icons';

const styles = {
  row: {
    paddingVertical: STYLE.PADDING.VERTICAL,
    height: STYLE.HEIGHT.SENSOR_ROW,
  },
};

export const SensorRowLayout = ({ Chart, SensorStatus, onPress, direction }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Row justifyContent="space-between" alignItems="center" style={styles.row}>
        <Column justifyContent="center">{Chart}</Column>
        <Column justifyContent="center">{SensorStatus}</Column>
        <Column justifyContent="center">
          {!!onPress && (
            <HalfCircleButton direction={direction} Icon={<Chevron direction={direction} />} />
          )}
        </Column>
      </Row>
    </TouchableOpacity>
  );
};
