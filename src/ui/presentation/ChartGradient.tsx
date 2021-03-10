import React, { FC } from 'react';
import { Stop, Defs, LinearGradient } from 'react-native-svg';

import { COLOUR } from '../../common/constants';

const CONSTANTS = {
  DEFAULT_ID: 'grad',
  X1: '0%',
  X2: '0%',
  Y1: '0%',
  Y2: '100%',
  OFFSET_ONE: '0%',
  OFFSET_TWO: '40%',
  OFFSET_THREE: '80%',
  OPACITY: '1',
};

interface ChartGradientProps {
  id: string;
}

export const ChartGradient: FC<ChartGradientProps> = ({ id = CONSTANTS.DEFAULT_ID }) => (
  <Defs>
    <LinearGradient id={id} x1={CONSTANTS.X1} y1={CONSTANTS.Y1} x2={CONSTANTS.X2} y2={CONSTANTS.Y2}>
      <Stop
        offset={CONSTANTS.OFFSET_ONE}
        stopColor={COLOUR.DANGER}
        stopOpacity={CONSTANTS.OPACITY}
      />
      <Stop
        offset={CONSTANTS.OFFSET_TWO}
        stopColor={COLOUR.OFF_WHITE}
        stopOpacity={CONSTANTS.OPACITY}
      />
      <Stop
        offset={CONSTANTS.OFFSET_THREE}
        stopColor={COLOUR.PRIMARY}
        stopOpacity={CONSTANTS.OPACITY}
      />
    </LinearGradient>
  </Defs>
);
