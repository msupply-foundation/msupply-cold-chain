import { REDUCER } from '~constants';

describe('Constants: REDUCER', () => {
  it('Matches snapshot', () => {
    expect(REDUCER).toMatchSnapshot();
  });
});
