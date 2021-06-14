import { UtilService } from '~services/UtilService';

describe('Return value', () => {
  it('Returns a uuid from a v1 call on the underlying react-native-uuid dependency', () => {
    const utils = new UtilService();

    expect(utils.uuid()).toEqual('1');
  });
});

describe('getVersionCode', () => {
  it('returns the correct format', () => {
    const utils = new UtilService();

    expect(utils.getVersionCode('0.0.3')).toEqual(399);
    expect(utils.getVersionCode('0.0.4')).toEqual(499);
    expect(utils.getVersionCode('0.1.4')).toEqual(100499);
    expect(utils.getVersionCode('1.1.4')).toEqual(10100499);
    expect(utils.getVersionCode('1.1.4-rc1')).toEqual(10100401);
    expect(utils.getVersionCode('0.0.4-rc98')).toEqual(498);
  });
});

describe('UtilService:normaliseNumber', () => {
  it('normalises a battery level correctly', () => {
    const utils = new UtilService();

    expect(utils.normaliseNumber(70, [70, 100])).toBe(0);
    expect(utils.normaliseNumber(75, [70, 100])).toBe(16);
    expect(utils.normaliseNumber(80, [70, 100])).toBe(33);
    expect(utils.normaliseNumber(85, [70, 100])).toBe(50);
    expect(utils.normaliseNumber(90, [70, 100])).toBe(66);
    expect(utils.normaliseNumber(95, [70, 100])).toBe(83);
    expect(utils.normaliseNumber(100, [70, 100])).toBe(100);
  });
});

describe('UtilService:addMinute', () => {
  it('Correctly adds a single minute to a timestamp', () => {
    const utils = new UtilService();

    const one = 1;
    expect(utils.addMinute(one, 1)).toEqual(61);

    const two = 10000;
    expect(utils.addMinute(two, 1)).toEqual(10060);

    const three = Date.now();
    expect(utils.addMinute(three, 1)).toEqual(three + 60);
  });
});

describe('UtilService:startOfNextMinute', () => {
  it('Correctly returns the start of the next minute from some time', () => {
    const utils = new UtilService();

    const one = 1;
    expect(utils.startOfNextMinute(one, 1)).toEqual(60);

    const two = 10000;
    expect(utils.startOfNextMinute(two, 1)).toEqual(10020);
  });
});

describe('UtilService:timeUntilNextMinute', () => {
  it('Returns the correct number of seconds', () => {
    const utils = new UtilService();

    const one = 1;
    expect(utils.timeUntilNextMinute(one)).toEqual(59);
  });
});

describe('UtilService:now', () => {
  it('Returns a number when called with no params', () => {
    const utils = new UtilService();

    expect(typeof utils.now()).toBe('number');
  });
});

describe('UtilService:addDays', () => {
  it('Returns the correct number of seconds when adding a positive number of days', () => {
    const utils = new UtilService();

    const one = 0;
    const secondsInTenDays = 60 * 60 * 24 * 10;
    expect(utils.addDays(one, 10)).toEqual(0 + secondsInTenDays);

    const two = 0;
    const secondsInOneHundredDays = 60 * 60 * 24 * 100;
    expect(utils.addDays(two, 100)).toEqual(0 + secondsInOneHundredDays);
  });

  it('Returns the correct number of seconds when adding a negative number of days', () => {
    const utils = new UtilService();

    const one = 0;
    const secondsInTenDays = 60 * 60 * 24 * 10;
    expect(utils.addDays(one, -10)).toEqual(0 - secondsInTenDays);

    const two = 0;
    const secondsInOneHundredDays = 60 * 60 * 24 * 100;
    expect(utils.addDays(two, -100)).toEqual(0 - secondsInOneHundredDays);
  });
});
