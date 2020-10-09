import {
  ProgramReducer,
  ProgramInitialState,
  ProgramAction,
  // ProgramSaga,
} from '~features/Bluetooth';

describe('ProgramReducer', () => {
  it('Sets state correctly when updating log interval for a sensor is successful', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.updateLogIntervalSuccess('A', 300)
    );

    expect(newState).toEqual({ isProgramming: false, programmingByMac: {} });
  });
  it('Sets state correctly when programming sensor is successful', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.programNewSensorSuccess('A', 300)
    );

    expect(newState).toEqual({ isProgramming: false, programmingByMac: { A: false } });
  });
  it('Sets state correctly when trying to update the log interval', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.tryUpdateLogInterval('A', 300)
    );

    expect(newState).toEqual({ isProgramming: true, programmingByMac: {} });
  });
  it('Sets state correctly when trying to program', () => {
    const newState = ProgramReducer(
      ProgramInitialState,
      ProgramAction.tryProgramNewSensor('A', 300)
    );

    expect(newState).toEqual({ programmingByMac: { A: true }, isProgramming: true });
  });
});
