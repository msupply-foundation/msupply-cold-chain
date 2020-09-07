import { Text } from 'react-native';
import { Row } from '~layouts';
import { FONT, COLOUR } from '~constants';

const style = {
  text: {
    borderRightColor: COLOUR.DIVIDER_TWO,
    padding: 10,
    flex: 1,
    fontSize: FONT.SIZE.M,
    fontFamily: FONT.FAMILY.REGULAR,
    color: COLOUR.GREY_ONE,
  },
};

export const LogTableCell = ({ children, index, columns }) => {
  const { textAlign, flex } = columns[index];
  const isLast = columns.length - 1 !== index;
  const borderRightWidth = isLast ? 1 : undefined;
  const internalStyle = { ...style.text, borderRightWidth, textAlign, flex };
  return (
    <Cell flex={flex}>
      <Text style={internalStyle}>{children}</Text>
    </Cell>
  );
};

export const Cell = ({ children, flex = 1, viewStyle = {} }) => {
  return (
    <Row flex={flex} style={viewStyle}>
      {children}
    </Row>
  );
};
