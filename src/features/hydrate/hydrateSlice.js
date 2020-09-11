import { createSlice } from '@reduxjs/toolkit';

import { REDUCER } from '~constants';

const HydrateSelector = {
  temperatureLog({ hydrate }) {
    const { temperatureLog } = hydrate;
    return temperatureLog;
  },
  sensor({ hydrate }) {
    const { sensor } = hydrate;
    return sensor;
  },
  breachConfiguration({ hydrate }) {
    const { breachConfiguration } = hydrate;
    return breachConfiguration;
  },
  setting({ hydrate }) {
    const { setting } = hydrate;
    return setting;
  },

  logTable: ({ hydrate: { logTable } }) => {
    return logTable;
  },
  all({ hydrate }) {
    const { setting, temperatureLog, breachConfiguration, sensor } = hydrate;
    return setting && temperatureLog && breachConfiguration && sensor;
  },
};

const initialState = {
  temperatureLog: true,
  sensor: false,
  breachConfiguration: false,
  setting: false,
  chart: true,
};

const reducers = {
  logTable: draftState => {
    draftState.logTable = true;
    draftState.all = HydrateSelector.all({ hydrate: draftState });
  },
  temperatureLog: draftState => {
    draftState.temperatureLog = true;
    draftState.all = HydrateSelector.all({ hydrate: draftState });
  },
  sensor: draftState => {
    draftState.sensor = true;
    draftState.all = HydrateSelector.all({ hydrate: draftState });
  },
  breachConfiguration: draftState => {
    draftState.breachConfiguration = true;
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
