import Reactotron from 'reactotron-react-native';
import ReactotronFlipper from 'reactotron-react-native/dist/flipper';
import { reactotronRedux } from 'reactotron-redux';
import AsyncStorage from '@react-native-community/async-storage';

import { displayName } from './app.json';

const config = { name: displayName, createSocket: path => new ReactotronFlipper(path) };

export const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure(config)
  .use(reactotronRedux())
  .useReactNative()
  .connect();
