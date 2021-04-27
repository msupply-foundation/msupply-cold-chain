import { AppRegistry } from 'react-native';
import { getStorybookUI, configure } from '@storybook/react-native';

import { name as appName } from '../../../app.json';

configure(() => {
  require('./stories');
}, module);

export const Storybook = getStorybookUI({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  asyncStorage: require('@react-native-async-storage/async-storage').default,
});

AppRegistry.registerComponent(appName, () => Storybook);
