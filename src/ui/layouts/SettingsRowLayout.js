import React from 'react';
import { View } from 'react-native';
import { Row } from './Row';
import { Divider } from '~presentation';

import { COLOUR, STYLE } from '~constants';
import { Column } from './Column';
import { FlexPaddingView } from './FlexPaddingView';

import { Centered } from './Centered';

const style = {
  row: {
    height: STYLE.HEIGHT.SETTINGS_ITEM,
    backgroundColor: COLOUR.WHITE,
    paddingLeft: STYLE.PADDING.HORIZONTAL,
  },
  iconContainer: { paddingRight: STYLE.PADDING.HORIZONTAL },
  subtext: { height: STYLE.HEIGHT.SUB_TEXT },
  leftIcon: { width: STYLE.WIDTH.SETTINGS_ICON },
};

export const SettingsRowLayout = ({
  Text = null,
  Subtext = null,
  LeftIcon = null,
  RightComponent = null,
}) => {
  return (
    <>
      <Row alignItems="center" justifyContent="space-between" style={style.row}>
        <Row alignItems="center">
          <Centered style={style.leftIcon}>{LeftIcon}</Centered>
          <Column>
            <FlexPaddingView height={STYLE.HEIGHT.SUB_TEXT} />
            {Text}
            <View style={style.subtext}>{Subtext}</View>
          </Column>
        </Row>
        <View style={style.iconContainer}>{RightComponent}</View>
      </Row>
      <Divider />
    </>
  );
};
