import { createContext } from 'react';
import DependencyLocator from './DependencyLocator';

export const DependencyLocatorContext = createContext<typeof DependencyLocator>(DependencyLocator);
