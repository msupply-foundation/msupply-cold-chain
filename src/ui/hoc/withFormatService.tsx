/* eslint-disable react/jsx-props-no-spreading */
import React, { ElementType, FC } from 'react';
import { DEPENDENCY } from '../../common/constants';
import { FormatService } from '../../common/services';
import { useDependency } from '../hooks';

// TODO: Type this better
export const withFormatService = (WrappedComponent: ElementType): FC => (props: any) => {
  const formatter = useDependency(DEPENDENCY.FORMAT_SERVICE) as FormatService;

  return <WrappedComponent {...props} formatter={formatter} />;
};
