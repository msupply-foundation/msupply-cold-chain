/* eslint-disable react/jsx-props-no-spreading */
import { DEPENDENCY } from '~constants';
import { useDependency } from '../hooks';

export const withFormatService = WrappedComponent => props => {
  const formatter = useDependency(DEPENDENCY.FORMAT_SERVICE);
  return <WrappedComponent {...props} formatter={formatter} />;
};
