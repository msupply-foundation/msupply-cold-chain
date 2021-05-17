import { ENTITIES } from '~constants';

describe('Constants: ENTITIES', () => {
  it('Matches snapshot', () => {
    expect(ENTITIES).toMatchSnapshot();
  });
});
