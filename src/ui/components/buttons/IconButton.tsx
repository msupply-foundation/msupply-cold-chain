import React, { FC, ReactElement } from 'react';
import { Pressable, TextProps, ViewStyle } from 'react-native';
import { IconProps } from '../../presentation/icons/Icon';

const style: ViewStyle = {
  marginHorizontal: 30,
  justifyContent: 'center',
  alignItems: 'center',
};

interface IconButtonProps {
  onPress: () => void;
  Icon: ReactElement<IconProps>;
  Text?: ReactElement<TextProps>;
}

export const IconButton: FC<IconButtonProps> = ({ onPress, Icon, Text }) => {
  return (
    <Pressable style={style} onPress={onPress}>
      {Icon}
      {Text}
    </Pressable>
  );
};
