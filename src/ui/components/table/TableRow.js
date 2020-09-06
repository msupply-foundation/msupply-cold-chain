import { Row } from '../../layouts';
import { COLOUR } from '../../../shared/constants';

export const LogTableRow = ({ index, children }) => {
  const viewStyle = { backgroundColor: index % 2 === 0 ? COLOUR.GREY_TWO : COLOUR.BACKGROUND_TWO };
  return <TableRow viewStyle={viewStyle}>{children}</TableRow>;
};

export const TableRow = ({ children, viewStyle }) => {
  return (
    <Row style={viewStyle} alignItems="center">
      {children}
    </Row>
  );
};
