import React from 'react';

import { Divider } from '~presentation';

import { Row } from './Row';
import { Column } from './Column';

export const SettingsEditButtonGroup = ({ children }) => {
  return (
    <Column style={{ width: '100%' }} alignItems="center" justifyContent="center">
      <Divider />
      <Row alignItems="space-between" justifyContent="space-between">
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, { border: i !== React.Children.count(children) - 1 })
        )}
      </Row>
    </Column>
  );
};
