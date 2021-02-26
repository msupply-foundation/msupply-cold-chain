import React, { FC } from 'react';
import { Pressable, Text as RNText, ViewStyle } from 'react-native';
import { Icon as AppIcon } from '../../presentation/icons/Icon';

const style: ViewStyle = {
  marginHorizontal: 30,
  justifyContent: 'center',
  alignItems: 'center',
};

interface IconButtonProps {
  onPress: () => void;
  Icon: typeof AppIcon;
  Text: typeof RNText;
}

export const IconButton: FC<IconButtonProps> = ({ onPress, Icon, Text }) => {
  return (
    <Pressable style={style} onPress={onPress}>
      {Icon}
      {Text}
    </Pressable>
  );
};
