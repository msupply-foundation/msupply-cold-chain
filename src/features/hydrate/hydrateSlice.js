import { createSlice } from '@reduxjs/toolkit';

import { REDUCER } from '~constants';

const HydrateSelector = {
  sensor({ hydrate }) {
    const { sensor } = hydrate;
    return sensor;
  },

  setting({ hydrate }) {
    const { setting } = hydrate;
    return setting;
  },

  all({ hydrate }) {
    const { setting, sensor } = hydrate;
    return setting && sensor;
  },
};

const initialState = {
  sensor: false,
  setting: false,
};

const reducers = {
  sensor: draftState => {
    draftState.sensor = true;
    draftState.all = HydrateSelector.all({ hydrate: draftState });
  },

  setting: draftState => {
    draftState.setting = true;
    draftState.all = HydrateSelector.all({ hydrate: draftState });
  },
};

const { actions: HydrateAction, reducer: HydrateReducer } = createSlice({
  initialState,
  name: REDUCER.HYDRATE,
  reducers,
});

const HydrateSaga = {};

export { HydrateAction, HydrateReducer, HydrateSaga, HydrateSelector };
