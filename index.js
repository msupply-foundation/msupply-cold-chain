import { AppRegistry, LogBox } from 'react-native';

import App from './src/ui/App';
import { name as appName } from './app.json';

LogBox.ignoreLogs(['Require cycle:']);

AppRegistry.registerComponent(appName, () => App);
