const { PERMISSIONS, RESULTS } = {
  PERMISSIONS: {
    ANDROID: {
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
  },
};
export { PERMISSIONS, RESULTS };

export const openSettings = jest.fn(async () => {});
export const check = jest.fn(async () => RESULTS.GRANTED);
export const request = jest.fn(async () => RESULTS.GRANTED);

const notificationOptions = ['alert', 'badge', 'sound', 'criticalAlert', 'carPlay'];

const notificationSettings = {
  alert: true,
  badge: true,
  sound: true,
  carPlay: true,
  criticalAlert: true,
  lockScreen: true,
  notificationCenter: true,
};

export const checkNotifications = jest.fn(async () => ({
  status: RESULTS.GRANTED,
  settings: notificationSettings,
}));

export const requestNotifications = jest.fn(async options => ({
  status: RESULTS.GRANTED,
  settings: options
    .filter(option => notificationOptions.includes(option))
    .reduce((acc, option) => ({ ...acc, [option]: true }), {
      lockScreen: true,
      notificationCenter: true,
    }),
}));

export const checkMultiple = jest.fn(async permissions =>
  permissions.reduce((acc, permission) => ({
    ...acc,
    [permission]: RESULTS.GRANTED,
  }))
);

export const requestMultiple = jest.fn(async permissions =>
  permissions.reduce((acc, permission) => ({
    ...acc,
    [permission]: RESULTS.GRANTED,
  }))
);

export default {
  PERMISSIONS,
  RESULTS,
  openSettings,
  check,
  request,
  checkNotifications,
  requestNotifications,
  checkMultiple,
  requestMultiple,
};
