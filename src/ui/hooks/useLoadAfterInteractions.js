import { useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';

export const useLoadAfterInteractions = () => {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => setLoad(true));
  }, []);

  return load;
};
