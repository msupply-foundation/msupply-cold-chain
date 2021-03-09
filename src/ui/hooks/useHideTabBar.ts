import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export const useHideTabBar = (): void => {
  const navigation = useNavigation();
  useEffect(() => {
    if (navigation) {
      navigation.dangerouslyGetParent()?.setOptions({ tabBarVisible: false });
      return () => navigation.dangerouslyGetParent()?.setOptions({ tabBarVisible: true });
    }
  }, [navigation]);
};
