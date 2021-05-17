import { UtilService } from '~services/UtilService';

describe('Return value', () => {
  it('Returns a uuid from a v1 call on the underlying react-native-uuid dependency', () => {
    const utils = new UtilService();

    expect(utils.uuid()).toEqual('1');
  });
});
