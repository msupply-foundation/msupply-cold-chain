import path from 'path';
import initStoryshots from '@storybook/addon-storyshots';

beforeEach(() => jest.useFakeTimers());

initStoryshots({
  configPath: path.resolve(__dirname, '../'),
});
