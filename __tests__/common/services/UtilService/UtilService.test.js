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

    expect(utils.normaliseNumber(75, [75, 100])).toBe(0);
    expect(utils.normaliseNumber(80, [75, 100])).toBe(20);
    expect(utils.normaliseNumber(85, [75, 100])).toBe(40);
    expect(utils.normaliseNumber(90, [75, 100])).toBe(60);
    expect(utils.normaliseNumber(95, [75, 100])).toBe(80);
    expect(utils.normaliseNumber(100, [75, 100])).toBe(100);
  });
});
