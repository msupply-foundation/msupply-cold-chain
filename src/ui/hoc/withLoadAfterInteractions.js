/* eslint-disable react/jsx-props-no-spreading */
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { useLoadAfterInteractions } from '../hooks';
import { Centered } from '../layouts';

export const withLoadAfterInteractions = WrappedComponent => props => {
  const load = useLoadAfterInteractions();

  return load ? (
    <WrappedComponent {...props} />
  ) : (
    <Centered style={{ width: '100%', height: '100%' }}>
      <ActivityIndicator size="large" color={COLOUR.PRIMARY} />
    </Centered>
  );
};
