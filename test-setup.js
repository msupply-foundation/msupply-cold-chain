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
