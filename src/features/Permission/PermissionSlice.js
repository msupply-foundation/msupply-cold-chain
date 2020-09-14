import { createSlice } from '@reduxjs/toolkit';

import { eventChannel } from 'redux-saga';
import { take, call, delay, getContext, put, takeLatest, takeLeading } from 'redux-saga/effects';
import { DEPENDENCY, MILLISECONDS, REDUCER } from '~constants';

const initialState = {
  hasStoragePermission: false,
  hasLocationPermission: false,
  isLocationServicesOn: false,
  isBluetoothOn: false,
  initialRequestsComplete: false,
};

const reducers = {
  requestAndWatchPermissions: () => {},
  requestInitialPermissionsSuccess: draftState => {
    draftState.initialRequestsComplete = true;
  },
  requestInitialPermissionsFail: () => {},
  watchStoragePermission: () => {},
  requestStoragePermission: () => {},
  checkStoragePermission: () => {},
  updateStoragePermission: {
    prepare: newState => ({ payload: { newState } }),
    reducer: (draftState, { payload: { newState } }) => {
      draftState.hasStoragePermission = newState;
    },
  },
  watchLocationPermission: { prepare: () => ({}), reducer: () => {} },
  requestLocationPermission: { prepare: () => ({}), reducer: () => {} },
  checkLocationPermission: { prepare: () => ({}), reducer: () => {} },
  updateLocationPermission: {
    prepare: newState => ({ payload: { newState } }),
    reducer: (draftState, { payload: { newState } }) => {
      draftState.hasLocationPermission = newState;
    },
  },
  watchBluetoothStatus: { prepare: () => ({}), reducer: () => {} },
  requestBluetoothEnabled: { prepare: () => ({}), reducer: () => {} },
  checkBluetoothStatus: { prepare: () => ({}), reducer: () => {} },
  updateBluetoothStatus: {
    prepare: newStatus => ({ payload: { newStatus } }),
    reducer: (draftState, { payload: { newStatus } }) => {
      draftState.isBluetoothOn = newStatus;
    },
  },
  watchLocationServicesStatus: { prepare: () => ({}), reducer: () => {} },
  requestLocationServicesEnabled: { prepare: () => ({}), reducer: () => {} },
  checkLocationServicesStatus: { prepare: () => ({}), reducer: () => {} },
  updateLocationServicesStatus: {
    prepare: newStatus => ({ payload: { newStatus } }),
    reducer: (draftState, { payload: { newStatus } }) => {
      draftState.isLocationServicesOn = newStatus;
    },
  },
};

const { actions: PermissionAction, reducer: PermissionReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.PERMISSION,
});

function* requestLocationPermission() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestLocationPermission);
  yield put(PermissionAction.updateLocationPermission(result));
}

function* checkLocationPermission() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.hasLocationPermission);
  yield put(PermissionAction.updateLocationPermission(result));
}

function* watchLocationPermission() {
  while (true) {
    yield put(PermissionAction.checkLocationPermission());
    yield delay(MILLISECONDS.TEN_SECONDS);
  }
}

function* requestStoragePermission() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestStoragePermission);
  yield put(PermissionAction.updateStoragePermission(result));
}

function* checkStoragePermission() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.hasStoragePermission);
  yield put(PermissionAction.updateStoragePermission(result));
}

function* watchStoragePermission() {
  while (true) {
    yield put(PermissionAction.checkStoragePermission());
    yield delay(MILLISECONDS.TEN_SECONDS);
  }
}

function* checkLocationServicesStatus() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.checkLocationServicesStatus);
  yield put(PermissionAction.updateLocationServicesStatus(result));
}

function* watchLocationServicesStatus() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);

  const eventStream = () => {
    return eventChannel(emitter => {
      const subscription = permissionService.addFeatureStatusListener('location', newStatus => {
        emitter(newStatus);
      });

      return () => subscription?.remove();
    });
  };

  yield put(PermissionAction.checkLocationServicesStatus());
  const channel = yield call(eventStream);

  while (true) {
    const newStatus = yield take(channel);
    yield put(PermissionAction.updateLocationServicesStatus(newStatus));
  }
}

function* requestBluetoothEnabled() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestBluetoothEnabled);
  yield put(PermissionAction.updateBluetoothStatus(result));
}

function* requestLocationServicesEnabled() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestLocationServicesEnabled);
  yield put(PermissionAction.updateLocationServicesStatus(result));
}

function* checkBluetoothStatus() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.checkBluetoothStatus);
  yield put(PermissionAction.updateBluetoothStatus(result));
}

function* watchBluetoothStatus() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);

  const eventStream = () => {
    return eventChannel(emitter => {
      const subscription = permissionService.addFeatureStatusListener('bluetooth', newStatus => {
        emitter(newStatus);
      });
      return () => subscription?.remove();
    });
  };

  yield put(PermissionAction.checkBluetoothStatus());
  const channel = yield call(eventStream);

  while (true) {
    const newStatus = yield take(channel);
    yield put(PermissionAction.updateBluetoothStatus(newStatus));
  }
}

function* requestAndWatchPermissions() {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);

  const storagePermissionGranted = yield call(permissionService.requestStoragePermission);
  yield put(PermissionAction.updateStoragePermission(storagePermissionGranted));

  const locationPermissionGranted = yield call(permissionService.requestLocationPermission);
  yield put(PermissionAction.updateStoragePermission(locationPermissionGranted));

  const locationServicesStatus = yield call(permissionService.requestLocationServicesEnabled);
  yield put(PermissionAction.updateLocationServicesStatus(locationServicesStatus));

  const bluetoothStatus = yield call(permissionService.requestBluetoothEnabled);
  yield put(PermissionAction.updateLocationServicesStatus(bluetoothStatus));

  yield put(PermissionAction.requestInitialPermissionsSuccess());

  yield put(PermissionAction.watchLocationPermission());
  yield put(PermissionAction.watchStoragePermission());
  yield put(PermissionAction.watchBluetoothStatus());
  yield put(PermissionAction.watchLocationServicesStatus());
}

function* root() {
  yield takeLatest(PermissionAction.watchStoragePermission, watchStoragePermission);
  yield takeLeading(PermissionAction.checkStoragePermission, checkStoragePermission);
  yield takeLeading(PermissionAction.requestStoragePermission, requestStoragePermission);

  yield takeLatest(PermissionAction.watchLocationPermission, watchLocationPermission);
  yield takeLeading(PermissionAction.checkLocationPermission, checkLocationPermission);
  yield takeLeading(PermissionAction.requestLocationPermission, requestLocationPermission);

  yield takeLatest(PermissionAction.watchBluetoothStatus, watchBluetoothStatus);
  yield takeLatest(PermissionAction.checkBluetoothStatus, checkBluetoothStatus);
  yield takeLatest(PermissionAction.requestBluetoothEnabled, requestBluetoothEnabled);

  yield takeLatest(PermissionAction.watchLocationServicesStatus, watchLocationServicesStatus);
  yield takeLatest(PermissionAction.checkLocationServicesStatus, checkLocationServicesStatus);
  yield takeLatest(PermissionAction.requestLocationServicesEnabled, requestLocationServicesEnabled);

  yield takeLatest(PermissionAction.requestAndWatchPermissions, requestAndWatchPermissions);
}

const PermissionSaga = {
  root,
  watchStoragePermission,
  checkStoragePermission,
  requestStoragePermission,
};

const PermissionSelector = {
  showLocationServicesModal: ({ permission }) => {
    const { isLocationServicesOn, initialRequestsComplete } = permission;
    return !isLocationServicesOn && initialRequestsComplete;
  },
  showBluetoothModal: ({ permission }) => {
    const { isBluetoothOn, initialRequestsComplete } = permission;
    return !isBluetoothOn && initialRequestsComplete;
  },
  showLocationPermissionModal: ({ permission }) => {
    const { hasLocationPermission, initialRequestsComplete } = permission;
    return !hasLocationPermission && initialRequestsComplete;
  },
  showStoragePermissionModal: ({ permission }) => {
    const { hasStoragePermission, initialRequestsComplete } = permission;
    return !hasStoragePermission && initialRequestsComplete;
  },
};

export { PermissionAction, PermissionReducer, PermissionSaga, PermissionSelector };
