import React from 'react';
import { View } from 'react-native';

import { COLOUR, STYLE } from '~constants';

import { Column } from '~layouts';
import { Divider } from '~presentation';
import { BoldText } from '~presentation/typography';

export const SettingsGroup = ({ children, title }) => (
  <Column style={{ marginTop: 10 }}>
    <View style={{ paddingLeft: STYLE.WIDTH.SETTINGS_ICON + STYLE.PADDING.HORIZONTAL }}>
      <BoldText colour={COLOUR.SECONDARY}>{title.toUpperCase()}</BoldText>
    </View>
    <Divider />
    {children}
  </Column>
);
