import React, { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DetailAction, DetailSelector } from '../../features';
import { SensorDetailActionBarLayout } from '../layouts';
import { ExportDataModal, WritingLogsModal } from './modal';
import { IconButton } from './buttons';
import { DateRangeFilter } from './DateRangeFilter';
import { Icon } from '../presentation/icons';
import { RootState } from '../../common/store/store';

interface SensorDetailActionBarProps {
  id: string;
}

export const SensorDetailActionBar: FC<SensorDetailActionBarProps> = ({ id }) => {
  const dispatch = useDispatch();
  const [exportModalVariant, setExportModalVariant] = useState<'email' | '' | 'export'>('');
  const updateDateRange = (from: number, to: number) =>
    dispatch(DetailAction.updateDateRange(from, to));

  const { possibleFrom, possibleTo } = useSelector((state: RootState) =>
    DetailSelector.possibleFromTo(state)
  );

  const fromToRange = useSelector((state: RootState) => DetailSelector.fromToRange(state));
  const isLoading = useSelector((state: RootState) => DetailSelector.isLoading(state));

  return (
    <>
      <SensorDetailActionBarLayout
        Filters={
          !isLoading ? (
            <DateRangeFilter
              initialRange={fromToRange}
              maximumDate={possibleTo}
              minimumDate={possibleFrom}
              onConfirm={updateDateRange}
            />
          ) : null
        }
        Actions={
          <>
            <IconButton Icon={<Icon.Download />} onPress={() => setExportModalVariant('export')} />
            <IconButton Icon={<Icon.Email />} onPress={() => setExportModalVariant('email')} />
          </>
        }
      />
      <WritingLogsModal />
      <ExportDataModal
        id={id}
        variant={exportModalVariant}
        isOpen={!!exportModalVariant}
        onClose={() => setExportModalVariant('')}
        onConfirm={() => setExportModalVariant('')}
      />
    </>
  );
};
