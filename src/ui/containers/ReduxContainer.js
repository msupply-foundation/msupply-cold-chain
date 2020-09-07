import { Provider as ReduxProvider } from 'react-redux';

import { store } from '~store';

export const ReduxContainer = props => {
  const { children } = props;
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
};
