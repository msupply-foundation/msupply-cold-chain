import { PERMISSIONS } from 'react-native-permissions';

export const BLUETOOTH_STATE = {
  UNKNOWN: 'Unknown',
  UNSUPPORTED: 'Unsupported',
  UNAUTHORIZED: 'Unauthorized',
  OFF: 'PoweredOff',
  ON: 'PoweredOn',
};

export const PERMISSION_STATE = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
};

export const PERMISSION = {
  LOCATION: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  STORAGE: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
};

export const DANGEROUS_BATTERY_LEVEL = 20;
