import { DependencyLocator } from '~services/DependencyLocator';

beforeEach(() => {
  __DEV__ = true;
});
beforeEach(() => DependencyLocator.deleteAll());

describe('DependencyLocator: register', () => {
  it('Correctly registers a dependency', () => {
    __DEV__ = true;
    const locator = DependencyLocator;

    const dependency = {};
    locator.register('bleService', dependency);

    expect(locator.dependencies.bleService).toBe(dependency);
  });
});

describe('DependencyLocator: get', () => {
  it('Returns the correct dependency', () => {
    const locator = DependencyLocator;
    const dependency = {};
    locator.register('bleService', dependency);

    expect(locator.get('bleService')).toBe(dependency);
  });
});
