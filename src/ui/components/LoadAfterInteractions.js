import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { useLoadAfterInteractions } from '../hooks';

const styles = { loading: { flex: 1, justifyContent: 'center', alignItems: 'center' } };

export const LoadAfterInteractions = ({
  children,
  Loading = <ActivityIndicator size="large" color={COLOUR.PRIMARY} style={styles.loading} />,
  withDelay = true,
}) => {
  const [delay, setDelay] = useState(withDelay);
  const load = useLoadAfterInteractions();

  useEffect(() => {
    setTimeout(() => setDelay(false), 500);
  }, []);

  if (load && children) {
    return children;
  }

  if (delay) {
    return null;
  }

  return Loading;
};
