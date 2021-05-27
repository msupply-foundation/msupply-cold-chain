import React, { FC, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

const useHideSplashScreenOnMount = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
};

export const SplashScreenContainer: FC = ({ children }) => {
  useHideSplashScreenOnMount();

  return <>{children}</>;
};
