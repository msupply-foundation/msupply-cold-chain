class DependencyLocator {
  constructor() {
    this.dependencies = {};
  }

  get = keyOrKeys => {
    if (Array.isArray(keyOrKeys)) return keyOrKeys.map(key => this.get(key));
    const dependency = this.dependencies[keyOrKeys];
    return dependency;
  };

  register = (key, dependency) => {
    this.dependencies[key] = dependency;
    return true;
  };

  deleteAll = () => {
    if (__DEV__) {
      Object.keys(this.dependencies).forEach(key => {
        this.dependencies[key] = null;
      });
    } else {
      throw new Error();
    }
  };
}

export default new DependencyLocator();
