import React, { FC, ReactNode } from 'react';
import { Column } from './Column';
import { Row } from './Row';

const style = {
  container: { backgroundColor: '#dddddd', padding: 20 },
};

interface SensorDetailActionBarLayoutProps {
  Filters: ReactNode;
  Actions: ReactNode;
}

export const SensorDetailActionBarLayout: FC<SensorDetailActionBarLayoutProps> = ({
  Filters,
  Actions,
}) => {
  return (
    <Row justifyContent="space-between" alignItems="center" style={style.container}>
      <Column>{Filters}</Column>
      <Row>{Actions}</Row>
    </Row>
  );
};
