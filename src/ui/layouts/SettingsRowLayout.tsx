import React, { FC, ReactNode } from 'react';
import { View } from 'react-native';
import { Row } from './Row';
import { Divider } from '../presentation';
import { COLOUR, STYLE } from '../../common/constants';
import { Column } from './Column';

import { Centered } from './Centered';

const style = {
  row: {
    height: STYLE.HEIGHT.SETTINGS_ITEM,
    backgroundColor: COLOUR.WHITE,
  },
  iconContainer: { paddingRight: STYLE.PADDING.HORIZONTAL },
  subtext: { height: STYLE.HEIGHT.SUB_TEXT + 50 },
  leftIcon: { width: STYLE.WIDTH.SETTINGS_ICON },
};

interface SettingsRowLayoutProps {
  Text?: ReactNode;
  Subtext?: ReactNode;
  LeftIcon?: ReactNode;
  RightComponent?: ReactNode;
}

export const SettingsRowLayout: FC<SettingsRowLayoutProps> = ({
  Text = null,
  Subtext = null,
  LeftIcon = null,
  RightComponent = null,
}) => {
  return (
    <>
      <Row alignItems="center" justifyContent="space-between" style={style.row}>
        <Row flex={2} alignItems="center">
          <Centered style={style.leftIcon}>{LeftIcon}</Centered>
          <Column justifyContent="center">
            {Text}
            {Subtext}
          </Column>
        </Row>
        {RightComponent && (
          <Row flex={1} justifyContent="flex-end" style={style.iconContainer}>
            {RightComponent}
          </Row>
        )}
      </Row>
      <Divider />
    </>
  );
};
