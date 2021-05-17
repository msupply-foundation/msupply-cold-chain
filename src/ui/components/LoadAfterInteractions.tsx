import React, { FC, useState, useEffect, ReactNode } from 'react';
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { COLOUR } from '../../common/constants';
import { useLoadAfterInteractions } from '../hooks';

const styles: StyleProp<ViewStyle> = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

interface LoadAfterInteractionsProps {
  Loading?: ReactNode;
  withDelay?: boolean;
}

export const LoadAfterInteractions: FC<LoadAfterInteractionsProps> = ({
  children,
  Loading = <ActivityIndicator size="large" color={COLOUR.PRIMARY} style={styles} />,
  withDelay = true,
}) => {
  const [delay, setDelay] = useState(withDelay);
  const load = useLoadAfterInteractions();

  // Only show a spinner if the interactions take longer than
  // 500ms
  useEffect(() => {
    setTimeout(() => setDelay(false), 500);
  }, []);

  if (load && children) {
    return <>{children}</>;
  }

  if (delay) {
    return null;
  }

  return <>{Loading}</>;
};
