import React from 'react';

import { COLOUR } from '~constants';
import { useToggle, useCombinedCallback } from '../hooks';

import { Icon } from '../presentation/icons';
import { NormalText } from '../presentation/typography';
import { IconButton } from './buttons';
import { DateRangePicker } from './DateRangePicker';

export const DateRangeFilter = React.memo(
  ({ initialRange, maximumDate, minimumDate, onConfirm }) => {
    const [isOpen, toggle] = useToggle(false);

    const callback = useCombinedCallback((from, to) => onConfirm(from, to), toggle);

    return (
      <>
        <IconButton
          onPress={toggle}
          Icon={<Icon.Calendar />}
          Text={<NormalText colour={COLOUR.GREY_ONE}>{initialRange.format()}</NormalText>}
        />

        <DateRangePicker
          onClose={toggle}
          isOpen={isOpen}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          initialStart={initialRange.start()}
          initialEnd={initialRange.end()}
          onConfirm={callback}
          onCancel={toggle}
        />
      </>
    );
  }
);
