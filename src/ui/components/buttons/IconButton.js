import { Pressable } from 'react-native';

const style = {
  marginHorizontal: 30,
  justifyContent: 'center',
  alignItems: 'center',
};

export const IconButton = ({ onPress, Icon, Text }) => {
  return (
    <Pressable style={style} onPress={onPress}>
      {Icon}
      {Text}
    </Pressable>
  );
};
