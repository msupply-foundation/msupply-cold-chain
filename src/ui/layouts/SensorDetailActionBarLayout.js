import { Column } from './Column';
import { Row } from './Row';

const style = {
  container: { backgroundColor: '#dddddd', padding: 20 },
};

export const SensorDetailActionBarLayout = ({ Filters, Actions }) => {
  return (
    <Row justifyContent="space-between" alignItems="center" style={style.container}>
      <Column>{Filters}</Column>
      <Row>{Actions}</Row>
    </Row>
  );
};
