import { jest } from '@jest/globals';
import * as ReactNative from 'react-native';

jest.doMock('react-native', () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      NativeModules: {
        ...ReactNative.NativeModules,
        SussolBleManager: {
          getDevices: () => ({
            data: [{ id: '1', macAddress: 'AA:BB:CC:DD:EE:FF', batteryLevel: 90 }],
            success: true,
          }),
        },
      },
      ToastAndroid: {
        show: () => {},
        SHORT: 'short',
      },
    },
    ReactNative
  );
});
