import { DependencyLocator } from '~services/DependencyLocator';

beforeEach(() => {
  __DEV__ = true;
});
beforeEach(() => DependencyLocator.deleteAll());

describe('DependencyLocator: deleteAll', () => {
  it('Deletes all registered deps', () => {
    const locator = DependencyLocator;
    const dependency = {};
    locator.register('dependency', dependency);
    locator.deleteAll();

    expect(locator.dependencies).toEqual({ dependency: null });
  });
  it('Throws an error when DEV is false.', () => {
    __DEV__ = false;
    const locator = DependencyLocator;
    const dependency = {};
    locator.register('dependency', dependency);

    expect(locator.deleteAll).toThrow();
  });
});

describe('DependencyLocator: register', () => {
  it('Correctly registers a dependency', () => {
    __DEV__ = true;
    const locator = DependencyLocator;

    const dependency = {};
    locator.register('dependency', dependency);

    expect(locator.dependencies.dependency).toBe(dependency);
  });
});

describe('DependencyLocator: get', () => {
  it('Returns the correct dependency', () => {
    const locator = DependencyLocator;
    const dependency = {};
    locator.register('dependency', dependency);

    expect(locator.get('dependency')).toBe(dependency);
  });
  it('Returns the correct dependencies when passed an array of deps', () => {
    const locator = DependencyLocator;
    const dependencyOne = {};
    locator.register('dependencyOne', dependencyOne);
    const dependencyTwo = {};
    locator.register('dependencyTwo', dependencyTwo);

    expect(locator.get(['dependencyOne', 'dependencyTwo'])).toEqual([dependencyOne, dependencyTwo]);
  });
});
