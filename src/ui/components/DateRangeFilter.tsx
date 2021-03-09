import React, { FC } from 'react';
import { Moment } from 'moment';
import { COLOUR } from '../../common/constants';
import { useToggle, useCombinedCallback } from '../hooks';
import { Icon } from '../presentation/icons';
import { NormalText } from '../presentation/typography';
import { IconButton } from './buttons';
import { DateRangePicker } from './DateRangePicker';

interface DateRangeFilterProps {
  initialRange: Moment;
  maximumDate: number;
  minimumDate: number;
  onConfirm: (from: number, to: number) => void;
}

export const DateRangeFilter: FC<DateRangeFilterProps> = React.memo(
  ({ initialRange, maximumDate, minimumDate, onConfirm }) => {
    const [isOpen, toggle] = useToggle(false);

    const callback = useCombinedCallback((from: number, to: number) => onConfirm(from, to), toggle);

    return (
      <>
        <IconButton
          onPress={toggle}
          Icon={<Icon.Calendar />}
          Text={<NormalText color={COLOUR.GREY_ONE}>{initialRange.format()}</NormalText>}
        />

        <DateRangePicker
          isOpen={isOpen}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          // TODO: Fix twix typings
          initialStart={(initialRange as any).start()}
          initialEnd={(initialRange as any).end()}
          onConfirm={callback}
          onCancel={toggle}
        />
      </>
    );
  }
);
