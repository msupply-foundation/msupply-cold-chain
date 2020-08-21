import { View } from 'react-native';
import { STYLE, COLOUR } from '~constants';

export const Divider = ({
  width = STYLE.WIDTH.DIVIDER_FULL,
  height = 2,
  backgroundColor = COLOUR.DIVIDER,
}) => {
  return <View style={{ backgroundColor, width, height }} />;
};
