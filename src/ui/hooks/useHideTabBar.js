import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export const useHideTabBar = () => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.dangerouslyGetParent().setOptions({ tabBarVisible: false });
    return () => navigation.dangerouslyGetParent().setOptions({ tabBarVisible: true });
  }, []);
};
