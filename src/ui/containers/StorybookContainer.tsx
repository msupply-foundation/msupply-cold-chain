import React, { FC } from 'react';
import { useStorybook } from '../hooks';
import { Storybook } from '../storybook';

export const StorybookContainer: FC = ({ children }) => {
  const usingStorybook = useStorybook();

  // Children wrapped in a fragment to keep TS happy
  return usingStorybook ? <Storybook /> : <>{children}</>;
};
