import { CumulativeBreachManager } from '~features/Breach';

describe('CumulativeBreachManager: getCumulativeExposure', () => {
  it('returns a lookup of a cumulative breach', async () => {
    const fakeQueryResult = [
      { isHotCumulative: true, duration: 10 },
      { isColdCumulative: true, duration: 5 },
    ];
    const mockQuery = jest.fn(() => fakeQueryResult);
    const mockDbService = { query: mockQuery };
    const breachManager = new CumulativeBreachManager(mockDbService);

    const result = breachManager.getCumulativeExposure(0, 1, 'a');
    const resultShouldBe = {
      coldCumulative: {
        duration: 5,
        isColdCumulative: true,
      },
      hotCumulative: {
        duration: 10,
        isHotCumulative: true,
      },
    };

    await expect(result).resolves.toEqual(resultShouldBe);
  });
  it('The lookup returned has the correct cumulative breaches within for hot breaches', async () => {
    const fakeQueryResult = [{ isHotCumulative: true, duration: 10 }];
    const mockQuery = jest.fn(() => fakeQueryResult);
    const mockDbService = { query: mockQuery };
    const breachManager = new CumulativeBreachManager(mockDbService);

    const result = breachManager.getCumulativeExposure(0, 1, 'a');
    const resultShouldBe = { hotCumulative: { duration: 10, isHotCumulative: true } };

    await expect(result).resolves.toEqual(resultShouldBe);
  });
  it('The lookup returned has the correct cumulative breaches within for cold breaches', async () => {
    const fakeQueryResult = [{ isColdCumulative: true, duration: 10 }];
    const mockQuery = jest.fn(() => fakeQueryResult);
    const mockDbService = { query: mockQuery };
    const breachManager = new CumulativeBreachManager(mockDbService);

    const result = breachManager.getCumulativeExposure(0, 1, 'a');
    const resultShouldBe = { coldCumulative: { duration: 10, isColdCumulative: true } };

    await expect(result).resolves.toEqual(resultShouldBe);
  });
  it('The lookup returned has the correct cumulative breaches when there are none', async () => {
    const fakeQueryResult = [];
    const mockQuery = jest.fn(() => fakeQueryResult);
    const mockDbService = { query: mockQuery };
    const breachManager = new CumulativeBreachManager(mockDbService);

    const result = breachManager.getCumulativeExposure(0, 1, 'a');
    const resultShouldBe = {};

    await expect(result).resolves.toEqual(resultShouldBe);
  });
});
