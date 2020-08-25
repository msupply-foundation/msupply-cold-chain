import * as ReactNative from 'react-native';

jest.doMock('react-native', () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      NativeModules: {
        ...ReactNative.NativeModules,
        BleManager: {},
      },
    },
    ReactNative
  );
});

jest.mock('react-native-reanimated', () =>
  jest.requireActual('./node_modules/react-native-reanimated/mock')
);

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');
