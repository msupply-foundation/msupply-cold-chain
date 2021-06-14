import { SagaIterator } from 'redux-saga';
import { createSlice } from '@reduxjs/toolkit';
import { REDUCER } from '~constants';

const initialState = {};
const reducers = {
  hydrate: () => {},
};

const { actions: HydrateAction, reducer: HydrateReducer } = createSlice({
  initialState,
  reducers,
  name: REDUCER.HYDRATE,
});

function* root(): SagaIterator {}

const HydrateSaga = { root };
const HydrateSelector = {};

export { HydrateAction, HydrateReducer, HydrateSaga, HydrateSelector, initialState };
