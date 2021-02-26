import { Pressable } from 'react-native';
import { Cell } from './Cell';

import { MediumText } from '~presentation/typography';
import { Icon } from '../../presentation/icons';

export const TableHeaderCell = ({
  cellStyle = { paddingRight: 10 },
  contentContainerStyle = {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
  },
  isSorted,
  isAscending,
  title,
  onPress,
}) => {
  return (
    <Cell viewStyle={cellStyle}>
      <Pressable onPress={onPress} style={contentContainerStyle}>
        <MediumText>{title}</MediumText>
        <Icon.Sort isSorted={isSorted} isAscending={isAscending} />
      </Pressable>
    </Cell>
  );
};
