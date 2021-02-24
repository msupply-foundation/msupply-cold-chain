import React, { FC } from 'react';
import { useKeepAwake } from 'expo-keep-awake';

/**
 * As long as this container is mounted, the app will stay 'awake', and
 * not be sent to the background (unless explicitly sent by the user).
 */
export const KeepAwakeContainer: FC = ({ children }) => {
  useKeepAwake();

  return <>{children}</>;
};
