import React, { FC } from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import { COLOUR } from '../../common/constants';

const style: { scrollView: ViewStyle } = {
  scrollView: {
    backgroundColor: COLOUR.DIVIDER,
  },
};

export const SettingsList: FC = ({ children }) => (
  <ScrollView style={style.scrollView} keyboardShouldPersistTaps="always">
    {children}
  </ScrollView>
);
