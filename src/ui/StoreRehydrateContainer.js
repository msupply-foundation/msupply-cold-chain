import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { SensorAction } from '~sensor';
import { SettingAction } from '~setting';
import { BreachConfigurationAction } from '~breachConfiguration';

export const StoreRehydrateContainer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SensorAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(SettingAction.hydrate());
  }, []);

  useEffect(() => {
    dispatch(BreachConfigurationAction.init());
  }, []);

  return children;
};
