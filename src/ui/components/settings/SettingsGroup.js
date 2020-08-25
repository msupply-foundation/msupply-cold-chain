import React from 'react';
import { View } from 'react-native';

import { COLOUR, STYLE } from '~constants';

import { Column } from '~layouts';
import { Divider } from '~presentation';
import { BoldText } from '~presentation/typography';

const styles = {
  container: {
    paddingTop: 10,
    backgroundColor: COLOUR.OFF_WHITE,
  },
  textContainer: {
    paddingLeft: STYLE.WIDTH.SETTINGS_ICON,
  },
};

export const SettingsGroup = ({ children, title }) => (
  <Column style={styles.container}>
    <View style={styles.textContainer}>
      <BoldText colour={COLOUR.SECONDARY}>{title.toUpperCase()}</BoldText>
    </View>
    <Divider />
    {children}
  </Column>
);
