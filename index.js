import { AppRegistry, LogBox } from 'react-native';

import App from './src/ui/App';

// Moment.js plugin for date ranges- importing at the root so it
// injects moment.
import 'twix';

import { name as appName } from './app.json';

if (__DEV__) {
  require('./Reactotron.config');
}

LogBox.ignoreLogs(['Require cycle:']);

AppRegistry.registerComponent(appName, () => App);
