/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { useLoadAfterInteractions } from '../hooks';
import { Centered } from '../layouts';

export const withLoadAfterInteractions = WrappedComponent => props => {
  const load = useLoadAfterInteractions();
  const delay = useState(true);

  useEffect(() => {
    setTimeout(() => useState(false), 300);
  }, [load]);

  return load ? (
    <WrappedComponent {...props} />
  ) : (
    <Centered style={{ width: '100%', height: '100%' }}>
      {delay ? null : <ActivityIndicator size="large" color={COLOUR.PRIMARY} />}
    </Centered>
  );
};
