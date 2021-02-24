import { ParamListBase, RouteProp, useRoute } from '@react-navigation/native';

export const useRouteProps = <A extends ParamListBase, B extends keyof A>(): Readonly<
  A[B] | undefined
> => {
  const route = useRoute<RouteProp<A, B>>();
  const { params } = route;

  return params;
};
