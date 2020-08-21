import LinearGradient from 'react-native-linear-gradient';

import { COLOUR } from '~constants';

const styles = {
  container: { flex: 1 },
};

export const Gradient = ({ children }) => (
  <LinearGradient colors={COLOUR.BACKGROUND_GRADIENT} style={styles.container}>
    {children}
  </LinearGradient>
);
