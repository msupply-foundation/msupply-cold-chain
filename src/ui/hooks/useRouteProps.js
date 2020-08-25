import { useRoute } from '@react-navigation/native';

export const useRouteProps = () => {
  const route = useRoute();
  const { params } = route;

  return params;
};
