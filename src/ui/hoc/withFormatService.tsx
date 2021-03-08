/* eslint-disable react/jsx-props-no-spreading */
import React, { ElementType, ReactNode } from 'react';
import { DEPENDENCY } from '../../common/constants';
import { useDependency } from '../hooks';

// TODO: Type this better
export const withFormatService = (WrappedComponent: ElementType): ReactNode => (props: any) => {
  const formatter = useDependency(DEPENDENCY.FORMAT_SERVICE);

  return <WrappedComponent {...props} formatter={formatter} />;
};
