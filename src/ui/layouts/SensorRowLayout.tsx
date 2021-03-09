import React, { FC, ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

import { STYLE } from '../../common/constants';

import { Column } from './Column';
import { Row } from './Row';
import { HalfCircleButton } from '../components/buttons';
import { Icon } from '../presentation/icons';

const styles = {
  row: {
    paddingVertical: STYLE.PADDING.VERTICAL,
    height: STYLE.HEIGHT.SENSOR_ROW,
  },
};

interface SensorRowLayoutProps {
  Chart: ReactNode;
  SensorStatus: ReactNode;
  onPress: () => void;
  direction: 'left' | 'right';
}

export const SensorRowLayout: FC<SensorRowLayoutProps> = ({
  Chart,
  SensorStatus,
  onPress,
  direction,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Row justifyContent="space-between" alignItems="center" style={styles.row}>
        <Column justifyContent="center">{Chart}</Column>
        <Column justifyContent="center">{SensorStatus}</Column>
        <Column justifyContent="center">
          {!!onPress && (
            <HalfCircleButton direction={direction} Icon={<Icon.Chevron direction={direction} />} />
          )}
        </Column>
      </Row>
    </TouchableOpacity>
  );
};
