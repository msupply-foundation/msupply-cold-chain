import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { useLoadAfterInteractions } from '../hooks';

const styles = { loading: { flex: 1, justifyContent: 'center', alignItems: 'center' } };

export const LoadAfterInteractions = ({
  children,
  Loading = <ActivityIndicator size="large" color={COLOUR.PRIMARY} style={styles.loading} />,
}) => {
  const load = useLoadAfterInteractions();

  return load && children ? children : Loading;
};
