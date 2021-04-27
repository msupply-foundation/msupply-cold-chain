import { RootState } from './../../common/store/store';
import { SagaIterator } from '@redux-saga/types';
import { createSlice } from '@reduxjs/toolkit';

import { eventChannel } from 'redux-saga';
import { take, call, delay, getContext, put, takeLatest, takeLeading } from 'redux-saga/effects';
import { DEPENDENCY, MILLISECONDS, REDUCER } from '../../common/constants';

interface PermissionSliceState {
  hasStoragePermission: boolean;
  hasLocationPermission: boolean;
  isLocationServicesOn: boolean;
  isBluetoothOn: boolean;
  initialRequestsComplete: boolean;
}

interface UpdatePermissionAction {
  payload: { newState: boolean };
}

const initialState: PermissionSliceState = {
  hasStoragePermission: false,
  hasLocationPermission: false,
  isLocationServicesOn: false,
  isBluetoothOn: false,
  initialRequestsComplete: false,
};

const reducers = {
  requestAndWatchPermissions: () => {},
  requestInitialPermissionsSuccess: (draftState: PermissionSliceState) => {
    draftState.initialRequestsComplete = true;
  },
  requestInitialPermissionsFail: () => {},
  watchStoragePermission: () => {},
  requestStoragePermission: () => {},
  checkStoragePermission: () => {},
  updateStoragePermission: {
    prepare: (newState: boolean): UpdatePermissionAction => ({ payload: { newState } }),
    reducer: (
      draftState: PermissionSliceState,
      { payload: { newState } }: UpdatePermissionAction
    ) => {
      draftState.hasStoragePermission = newState;
    },
  },
  watchLocationPermission: () => {},
  requestLocationPermission: () => {},
  checkLocationPermission: () => {},
  updateLocationPermission: {
    prepare: (newState: boolean): UpdatePermissionAction => ({ payload: { newState } }),
    reducer: (
      draftState: PermissionSliceState,
      { payload: { newState } }: UpdatePermissionAction
    ) => {
      draftState.hasLocationPermission = newState;
    },
  },
  watchBluetoothStatus: () => {},
  requestBluetoothEnabled: () => {},
  checkBluetoothStatus: () => {},
  updateBluetoothStatus: {
    prepare: (newState: boolean): UpdatePermissionAction => ({ payload: { newState } }),
    reducer: (
      draftState: PermissionSliceState,
      { payload: { newState } }: UpdatePermissionAction
    ) => {
      draftState.isBluetoothOn = newState;
    },
  },
  watchLocationServicesStatus: () => {},
  requestLocationServicesEnabled: () => {},
  checkLocationServicesStatus: () => {},
  updateLocationServicesStatus: {
    prepare: (newState: boolean): UpdatePermissionAction => ({ payload: { newState } }),
    reducer: (
      draftState: PermissionSliceState,
      { payload: { newState } }: UpdatePermissionAction
    ) => {
      draftState.isLocationServicesOn = newState;
    },
  },
};

const { actions: PermissionAction, reducer: PermissionReducer } = createSlice({
  name: REDUCER.PERMISSION,
  initialState,
  reducers,
});

function* requestLocationPermission(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestLocationPermission);
  yield put(PermissionAction.updateLocationPermission(result));
}

function* checkLocationPermission(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.hasLocationPermission);
  yield put(PermissionAction.updateLocationPermission(result));
}

function* watchLocationPermission(): SagaIterator {
  while (true) {
    yield put(PermissionAction.checkLocationPermission());
    yield delay(MILLISECONDS.TEN_SECONDS);
  }
}

function* requestStoragePermission(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestStoragePermission);
  yield put(PermissionAction.updateStoragePermission(result));
}

function* checkStoragePermission(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.hasStoragePermission);
  yield put(PermissionAction.updateStoragePermission(result));
}

function* watchStoragePermission(): SagaIterator {
  while (true) {
    yield put(PermissionAction.checkStoragePermission());
    yield delay(MILLISECONDS.TEN_SECONDS);
  }
}

function* checkLocationServicesStatus(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.checkLocationServicesStatus);
  yield put(PermissionAction.updateLocationServicesStatus(result));
}

function* watchLocationServicesStatus(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);

  const eventStream = () => {
    return eventChannel(emitter => {
      const subscription = permissionService.addFeatureStatusListener(
        'location',
        (newStatus: boolean) => {
          emitter(newStatus);
        }
      );

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

function* requestBluetoothEnabled(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestBluetoothEnabled);
  yield put(PermissionAction.updateBluetoothStatus(result));
}

function* requestLocationServicesEnabled(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.requestLocationServicesEnabled);
  yield put(PermissionAction.updateLocationServicesStatus(result));
}

function* checkBluetoothStatus(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);
  const result = yield call(permissionService.checkBluetoothStatus);
  yield put(PermissionAction.updateBluetoothStatus(result));
}

function* watchBluetoothStatus(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);

  const eventStream = () => {
    return eventChannel(emitter => {
      const subscription = permissionService.addFeatureStatusListener(
        'bluetooth',
        (newStatus: boolean) => {
          emitter(newStatus);
        }
      );
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

function* requestAndWatchPermissions(): SagaIterator {
  const dependencyLocator = yield getContext(DEPENDENCY.LOCATOR);
  const permissionService = yield call(dependencyLocator.get, DEPENDENCY.PERMISSION_SERVICE);

  const storagePermissionGranted = yield call(permissionService.requestStoragePermission);
  yield put(PermissionAction.updateStoragePermission(storagePermissionGranted));

  const locationPermissionGranted = yield call(permissionService.requestLocationPermission);
  yield put(PermissionAction.updateLocationPermission(locationPermissionGranted));

  const locationServicesStatus = yield call(permissionService.requestLocationServicesEnabled);
  yield put(PermissionAction.updateLocationServicesStatus(locationServicesStatus));

  const bluetoothStatus = yield call(permissionService.requestBluetoothEnabled);
  yield put(PermissionAction.updateBluetoothStatus(bluetoothStatus));

  yield put(PermissionAction.requestInitialPermissionsSuccess());

  yield put(PermissionAction.watchLocationPermission());
  yield put(PermissionAction.watchStoragePermission());
  yield put(PermissionAction.watchBluetoothStatus());
  yield put(PermissionAction.watchLocationServicesStatus());
}

function* root(): SagaIterator {
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
  showLocationServicesModal: ({ permission }: RootState): boolean => {
    const { isLocationServicesOn, initialRequestsComplete } = permission;
    return !isLocationServicesOn && initialRequestsComplete;
  },
  showBluetoothModal: ({ permission }: RootState): boolean => {
    const { isBluetoothOn, initialRequestsComplete } = permission;
    return !isBluetoothOn && initialRequestsComplete;
  },
  showLocationPermissionModal: ({ permission }: RootState): boolean => {
    const { hasLocationPermission, initialRequestsComplete } = permission;
    return !hasLocationPermission && initialRequestsComplete;
  },
  showStoragePermissionModal: ({ permission }: RootState): boolean => {
    const { hasStoragePermission, initialRequestsComplete } = permission;
    return !hasStoragePermission && initialRequestsComplete;
  },
};

export { PermissionAction, PermissionReducer, PermissionSaga, PermissionSelector };
