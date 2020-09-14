import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';

import { BreachConfigurationReducer, BreachConfigurationSaga } from './BreachConfiguration';
import { SensorReducer, SensorSaga } from './Sensor';
import { SettingReducer, SettingSaga } from './Setting';

import { REDUCER } from '~constants';

export function* root() {
  yield fork(SensorSaga.root);
  yield fork(SettingSaga.root);
  yield fork(BreachConfigurationSaga.root);
}

export const EntitiesReducer = combineReducers({
  [REDUCER.SENSOR]: SensorReducer,
  [REDUCER.BREACH_CONFIGURATION]: BreachConfigurationReducer,
  [REDUCER.SETTING]: SettingReducer,
});

export const EntitiesSaga = { root };
