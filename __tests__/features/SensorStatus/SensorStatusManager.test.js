import { SensorStatusManager } from '~features/SensorStatus/SensorStatusManager';

describe('SensorStatusManager: ', () => {
  it('Returns sensor status', async () => {
    const query = jest.fn();
    const mockDbService = { query };

    const sensorStatusManager = new SensorStatusManager(mockDbService);
    sensorStatusManager.getSensorStatus('a');
  });
});
