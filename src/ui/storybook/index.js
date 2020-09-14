import { AppRegistry } from 'react-native';
import { getStorybookUI, configure } from '@storybook/react-native';

import { name as appName } from '../../../app.json';

configure(() => {
  require('./stories');
}, module);

export const Storybook = getStorybookUI({
  asyncStorage: require('@react-native-community/async-storage').default,
});

AppRegistry.registerComponent(appName, () => Storybook);
