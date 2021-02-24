import { SagaIterator } from '@redux-saga/types';
import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';
import { REDUCER } from '../../common/constants/Reducer';
import { BreachConfigurationReducer, BreachConfigurationSaga } from './BreachConfiguration';
import { SensorReducer, SensorSaga } from './Sensor';
import { SettingReducer, SettingSaga } from './Setting';

export function* root(): SagaIterator {
  yield fork(SensorSaga.root);
  yield fork(SettingSaga.root);
  yield fork(BreachConfigurationSaga.root);
}

export const EntitiesReducer = combineReducers({
  [REDUCER.SENSOR]: SensorReducer,
  [REDUCER.BREACH_CONFIGURATION]: BreachConfigurationReducer,
  [REDUCER.SETTING]: SettingReducer,
});

export type EntitiesState = ReturnType<typeof EntitiesReducer>;

export const EntitiesSaga = { root };
