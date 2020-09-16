import { combineReducers } from '@reduxjs/toolkit';
import { fork } from 'redux-saga/effects';

import { REDUCER } from '~constants';
import { AcknowledgeBreachReducer, AcknowledgeBreachSaga } from './AcknowledgeBreach';

import { ConsecutiveBreachReducer, ConsecutiveBreachSaga } from './ConsecutiveBreach';
import { CumulativeBreachReducer, CumulativeBreachSaga } from './CumulativeBreach';

export function* root() {
  yield fork(CumulativeBreachSaga.root);
  yield fork(ConsecutiveBreachSaga.root);
  yield fork(AcknowledgeBreachSaga.root);
}

export const BreachReducer = combineReducers({
  [REDUCER.CONSECUTIVE_BREACH]: ConsecutiveBreachReducer,
  [REDUCER.CUMULATIVE_BREACH]: CumulativeBreachReducer,
  [REDUCER.ACKNOWLEDGE_BREACH]: AcknowledgeBreachReducer,
});

export const BreachSaga = { root };
