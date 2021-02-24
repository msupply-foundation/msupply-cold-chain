import React, { FC } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '../../common/store';

export const ReduxContainer: FC = ({ children }) => {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
};
