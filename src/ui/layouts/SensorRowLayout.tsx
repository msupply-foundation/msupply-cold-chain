import React, { FC, ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

import { STYLE } from '../../common/constants';

import { Column } from './Column';
import { Row } from './Row';
import { HalfCircleButton } from '../components/buttons';
import { Icon } from '../presentation/icons';

const styles = {
  row: {
    height: 175,
  },
};

interface SensorRowLayoutProps {
  Chart: ReactNode;
  SensorStatus: ReactNode;
  onPress?: () => void;
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
      <Row style={styles.row}>
        <Column flex={3} justifyContent="center">
          {Chart}
        </Column>
        <Column flex={1} justifyContent="center" alignItems="flex-end">
          {SensorStatus}
        </Column>
        <Column style={{ flexBasis: 50 }} justifyContent="center" alignItems="flex-end">
          {!!onPress && (
            <HalfCircleButton direction={direction} Icon={<Icon.Chevron direction={direction} />} />
          )}
        </Column>
      </Row>
    </TouchableOpacity>
  );
};
