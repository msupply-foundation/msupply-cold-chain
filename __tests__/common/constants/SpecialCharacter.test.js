import { SPECIAL_CHARACTER } from '~constants';

describe('Constants: PERMISSION', () => {
  it('Matches snapshot', () => {
    expect(SPECIAL_CHARACTER).toMatchSnapshot();
  });
});
