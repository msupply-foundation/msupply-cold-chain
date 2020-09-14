import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';

import { REDUCER } from '~constants';

import { ConsecutiveBreachReducer, ConsecutiveBreachSaga } from './ConsecutiveBreach';
import { CumulativeBreachReducer, CumulativeBreachSaga } from './CumulativeBreach';

export function* root() {
  yield fork(CumulativeBreachSaga.root);
  yield fork(ConsecutiveBreachSaga.root);
}

export const BreachReducer = combineReducers({
  [REDUCER.CONSECUTIVE_BREACH]: ConsecutiveBreachReducer,
  [REDUCER.CUMULATIVE_BREACH]: CumulativeBreachReducer,
});

export const BreachSaga = { root };
