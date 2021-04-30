import { IsNull, Not } from 'typeorm/browser';
import { AcknowledgeBreachManager } from '../../../../src/features/Breach';
import { ENTITIES } from '../../../../src/common/constants';

describe('AcknowledgeBreachManager: getUnacknowledged', () => {
  it('returns unacknowledged breaches', () => {
    const unacknowledged = [{ id: 'a' }, { id: 'b' }];
    const mockQueryWith = jest.fn(() => {
      return unacknowledged;
    });
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new AcknowledgeBreachManager(mockDbService);

    const result = breachManager.getUnacknowledged('a');

    expect(result).resolves.toEqual(unacknowledged);
  });

  it('calls queryWith with the sensor id', () => {
    const unacknowledged = [{ id: 'a' }, { id: 'b' }];
    const mockQueryWith = jest.fn(() => {
      return unacknowledged;
    });
    const mockDbService = { queryWith: mockQueryWith };

    const breachManager = new AcknowledgeBreachManager(mockDbService);

    breachManager.getUnacknowledged('a');

    expect(mockQueryWith).toBeCalledTimes(1);
    expect(mockQueryWith).toBeCalledWith(ENTITIES.TEMPERATURE_BREACH, {
      where: { sensorId: 'a', endTimestamp: Not(IsNull()), acknowledged: false },
    });
  });
});

describe('AcknowledgeBreachManager: acknowledge', () => {
  it('Returns breaches with acknowledge having been set', () => {
    const unacknowledged = [{ id: 'a' }, { id: 'b' }];
    const mockUpsert = jest.fn((_, entities) => entities);
    const mockDbService = { upsert: mockUpsert };

    const breachManager = new AcknowledgeBreachManager(mockDbService);

    const result = breachManager.acknowledge(unacknowledged);
    const resultShouldBe = [
      { id: 'a', acknowledged: true },
      { id: 'b', acknowledged: true },
    ];

    expect(result).resolves.toEqual(resultShouldBe);
  });
  it('Calls upsert with the correct parameters', () => {
    const unacknowledged = [{ id: 'a' }, { id: 'b' }];
    const mockUpsert = jest.fn((_, entities) => entities);
    const mockDbService = { upsert: mockUpsert };

    const breachManager = new AcknowledgeBreachManager(mockDbService);

    breachManager.acknowledge(unacknowledged);
    const resultShouldBe = [
      { id: 'a', acknowledged: true },
      { id: 'b', acknowledged: true },
    ];

    expect(mockUpsert).toBeCalledTimes(1);
    expect(mockUpsert).toBeCalledWith(ENTITIES.TEMPERATURE_BREACH, resultShouldBe);
  });
});
