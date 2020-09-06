import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { ICON , COLOUR } from '~constants';


export const Download = () => {
  return <FontAwesome name={ICON.DOWNLOAD} color={COLOUR.SECONDARY} size={30} />;
};
