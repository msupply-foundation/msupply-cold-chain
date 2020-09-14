import { useStorybook } from '../hooks';
import { Storybook } from '~storybook';

export const StorybookContainer = ({ children }) => {
  const usingStorybook = useStorybook();

  return usingStorybook ? <Storybook /> : children;
};
