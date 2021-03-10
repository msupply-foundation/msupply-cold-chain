import React, { FC } from 'react';
import { ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { COLOUR } from '../../common/constants';

const style: { scrollView: ViewStyle } = {
  scrollView: {
    backgroundColor: COLOUR.DIVIDER,
  },
};

export const SettingsList: FC = ({ children }) => {
  return (
    <ScrollView keyboardShouldPersistTaps="always" style={style.scrollView}>
      {children}
    </ScrollView>
  );
};
