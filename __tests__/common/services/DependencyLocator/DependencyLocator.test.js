import { DependencyLocator } from '~services/DependencyLocator';

beforeEach(() => DependencyLocator.deleteAll());

describe('DependencyLocator: register', () => {
  it('Correctly registers a dependency', () => {
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
});
