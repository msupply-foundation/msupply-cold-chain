import { MILLISECONDS } from '~constants';

describe('Constants: MILLISECONDS', () => {
  it('Matches snapshot', () => {
    expect(MILLISECONDS).toMatchSnapshot();
  });
});
