import { FlatList } from 'react-native-gesture-handler';
import { LogTableRow } from './TableRow';
import { LogTableCell } from './Cell';

export const Table = ({
  data,
  columns,
  RowComponent = LogTableRow,
  CellComponent = LogTableCell,
}) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => (
        <RowComponent index={index}>
          {columns.map(({ key }, colIndex) => {
            return (
              <CellComponent columns={columns} index={colIndex}>
                {item[key]}
              </CellComponent>
            );
          })}
        </RowComponent>
      )}
    />
  );
};
