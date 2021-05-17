import { DANGEROUS_BATTERY_LEVEL, BLUETOOTH_STATE, PERMISSION_STATE, PERMISSION } from '~constants';

describe('Constants: PERMISSION', () => {
  it('Matches snapshot', () => {
    expect(PERMISSION).toMatchSnapshot();
  });
});

describe('Constants: PERMISSION_STATE', () => {
  it('Matches snapshot', () => {
    expect(PERMISSION_STATE).toMatchSnapshot();
  });
});

describe('Constants: BLUETOOTH_STATE', () => {
  it('Matches snapshot', () => {
    expect(BLUETOOTH_STATE).toMatchSnapshot();
  });
});

describe('Constants: DANGEROUS_BATTERY_LEVEL', () => {
  it('Matches snapshot', () => {
    expect(DANGEROUS_BATTERY_LEVEL).toMatchSnapshot();
  });
});
