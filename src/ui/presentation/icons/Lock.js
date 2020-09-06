import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { STYLE, ICON, COLOUR } from '~constants';

export const Lock = () => {
  return <FontAwesome size={STYLE.ICON.SIZE.L} name={ICON.LOCK} color={COLOUR.PRIMARY} />;
};

export const UnLock = () => {
  return <FontAwesome size={STYLE.ICON.SIZE.L} name={ICON.UNLOCK} color={COLOUR.PRIMARY} />;
};
