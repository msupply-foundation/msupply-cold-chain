import React, { FC, ReactNode } from 'react';
import { Divider } from '../presentation';
import { Row } from './Row';
import { Column } from './Column';

interface SettingsEditButtonGroupProps {
  children: ReactNode;
}

export const SettingsEditButtonGroup: FC<SettingsEditButtonGroupProps> = ({ children }) => {
  return (
    <Column style={{ width: '100%' }} alignItems="center" justifyContent="center">
      <Divider />
      <Row justifyContent="space-between">
        {children &&
          React.Children.map(children, (child, i) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                border: i !== React.Children.count(children) - 1,
              });
            }
            return null;
          })}
      </Row>
    </Column>
  );
};
