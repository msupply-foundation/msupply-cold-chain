import { MILLISECONDS } from './../../common/constants/Milliseconds';
import { useEffect, useReducer, useRef } from 'react';
import * as ExpoBattery from 'expo-battery';

/**
 * Hook which consolidates the different subscriptions expo-battery provides for easily calling from a component.
 *
 * react-native-device-info has a built in usePowerState hook which was used prior to this. Oddly, it seems to have
 * strange state updates putting the state returned into inconsistent values - sometimes a string and sometimes an
 * object with the standard power state values. What makes that hook more difficult is debugging - you can't log the
 * state changes of removing the charger cable as this will disconnect you from your debugger unless you use WiFi.
 *
 * So, re implemented the hook using expo-battery to have a more consistent state and the values as we utilize them
 * in the app.
 *
 * NOTE: When a device is plugged in and at 100%, it may set the `isCharging` state to FALSE. This could maybe be improved
 * by instead checking if the device is plugged in and show the charging icon in that case. I am not sure if we should do that
 * and show that the phone is charging when it is plugged in which may be less confusing for users or if we should listen to what
 * the OS is saying and display charging when the phone is really charging.
 */

enum PowerStateActionTypes {
  BatteryLevelUpdate = 'PowerLevelUpdate',
  BatteryStateUpdate = 'PowerStateUpdate',
  LowPowerModeUpdate = 'LowPowerModeUpdate',
}

type PowerStateAction =
  | {
      type: PowerStateActionTypes.BatteryLevelUpdate;
      payload: { batteryLevel: number };
    }
  | {
      type: PowerStateActionTypes.BatteryStateUpdate;
      payload: { powerState: ExpoBattery.BatteryState };
    }
  | {
      type: PowerStateActionTypes.LowPowerModeUpdate;
      payload: { isLowPowerMode: boolean };
    };

const Action = {
  batteryStateUpdated: (powerState: ExpoBattery.BatteryState): PowerStateAction => ({
    type: PowerStateActionTypes.BatteryStateUpdate,
    payload: { powerState },
  }),
  batteryLevelUpdated: (batteryLevel: number): PowerStateAction => ({
    type: PowerStateActionTypes.BatteryLevelUpdate,
    payload: { batteryLevel: Math.ceil(batteryLevel * 100) },
  }),
  lowPowerModeUpdated: (isLowPowerMode: boolean): PowerStateAction => ({
    type: PowerStateActionTypes.LowPowerModeUpdate,
    payload: { isLowPowerMode },
  }),
};

type PowerStateShape = {
  powerState: ExpoBattery.BatteryState;
  batteryLevel: number | undefined;
  isCharging: boolean;
  isLowPowerMode: boolean;
  isFull: boolean;
};

const initialState = (): PowerStateShape => ({
  powerState: ExpoBattery.BatteryState.UNKNOWN,
  batteryLevel: undefined,
  isCharging: false,
  isLowPowerMode: false,
  isFull: false,
});

const reducer = (state = initialState(), action: PowerStateAction): PowerStateShape => {
  switch (action.type) {
    case PowerStateActionTypes.BatteryStateUpdate: {
      const { payload } = action;
      const { powerState } = payload;

      const isCharging = powerState === ExpoBattery.BatteryState.CHARGING;
      const isFull = powerState === ExpoBattery.BatteryState.FULL;

      return {
        ...state,
        powerState,
        isCharging,
        isFull,
      };
    }

    case PowerStateActionTypes.BatteryLevelUpdate: {
      const { payload } = action;
      const { batteryLevel } = payload;

      return { ...state, batteryLevel };
    }

    case PowerStateActionTypes.LowPowerModeUpdate: {
      const { payload } = action;
      const { isLowPowerMode } = payload;

      return { ...state, isLowPowerMode };
    }

    default:
      return state;
  }
};

type BatteryLevel = number;

type BatteryLevelListener = (batteryLevel: BatteryLevel) => void;

class BatteryLevelSubject {
  listeners: Record<number, BatteryLevelListener>;

  intervalHandler: NodeJS.Timeout;

  currentId: number;

  constructor() {
    this.start();
    this.currentId = 0;
    this.listeners = {};
  }

  addListener(listener: BatteryLevelListener) {
    const id = this.currentId;
    this.listeners[id] = listener;
    this.currentId += 1;

    const remove = () => {
      delete this.listeners[id];
    };

    return remove;
  }

  start() {
    this.intervalHandler = setInterval(() => {
      ExpoBattery.getBatteryLevelAsync().then(batteryLevel => {
        Object.values(this.listeners).forEach(listener => {
          listener(batteryLevel);
        });
      });
    }, MILLISECONDS.TEN_SECONDS);
  }

  stop() {
    clearInterval(this.intervalHandler);
  }
}

export const usePowerState = (): PowerStateShape => {
  const batterLevelSubject = useRef(new BatteryLevelSubject());
  const [powerState, dispatch] = useReducer(reducer, initialState());

  useEffect(() => {
    const subscription = ExpoBattery.addBatteryStateListener(({ batteryState }) => {
      dispatch(Action.batteryStateUpdated(batteryState));
    });

    const getInitialBatteryState = async () => {
      const initialBatteryState = await ExpoBattery.getBatteryStateAsync();
      dispatch(Action.batteryStateUpdated(initialBatteryState));
    };

    getInitialBatteryState();

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const remove = batterLevelSubject.current.addListener(batteryLevel => {
      dispatch(Action.batteryLevelUpdated(batteryLevel));
    });

    const getInitialBatteryLevel = async () => {
      const initialBatteryLevel = await ExpoBattery.getBatteryLevelAsync();
      dispatch(Action.batteryLevelUpdated(initialBatteryLevel));
    };

    getInitialBatteryLevel();

    return () => remove();
  }, []);

  useEffect(() => {
    const subscription = ExpoBattery.addLowPowerModeListener(({ lowPowerMode }) => {
      dispatch(Action.lowPowerModeUpdated(lowPowerMode));
    });

    const getInitialLowPowerMode = async () => {
      const initialLowPowerMode = await ExpoBattery.isLowPowerModeEnabledAsync();
      dispatch(Action.lowPowerModeUpdated(initialLowPowerMode));
    };

    getInitialLowPowerMode();

    return () => subscription.remove();
  }, []);

  return powerState;
};
