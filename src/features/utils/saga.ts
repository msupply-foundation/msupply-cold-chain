import { SagaIterator } from '@redux-saga/types';
import {
  Dependency,
  DependencyKey,
  DependencyLocator,
} from '~services/DependencyLocator/DependencyLocator';
import { call, getContext } from 'redux-saga/effects';

export function* getDependency(key: DependencyKey): SagaIterator {
  const dependencyLocator: DependencyLocator = yield getContext('dependencyLocator');
  const dependency: Dependency = yield call(dependencyLocator.get, key);

  return dependency;
}
