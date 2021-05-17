import { useEffect, useState } from 'react';
import { DevSettings } from 'react-native';

export const useStorybook = (): boolean => {
  const [usingStorybook, setUsingStorybook] = useState(false);

  useEffect(() => {
    if (__DEV__) {
      const toggle = () => setUsingStorybook(active => !active);
      DevSettings.addMenuItem('Toggle Storybook', toggle);
    }
  }, [setUsingStorybook]);

  return usingStorybook;
};
