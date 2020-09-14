import { useStorybook } from '../hooks';
import { Storybook } from '../../../__tests__/ui/storybook';

export const StorybookContainer = ({ children }) => {
  const usingStorybook = useStorybook();

  return usingStorybook ? <Storybook /> : children;
};
