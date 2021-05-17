import React, { FC } from 'react';
import { ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { COLOUR } from '../../common/constants';

const styles: { container: ViewStyle } = {
  container: { flex: 1 },
};

export const Gradient: FC = ({ children }) => (
  <LinearGradient
    colors={[COLOUR.BACKGROUND_GRADIENT_START, COLOUR.BACKGROUND_GRADIENT_END]}
    style={styles.container}
  >
    {children}
  </LinearGradient>
);
