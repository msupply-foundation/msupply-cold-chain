import React, { useState } from 'react';

import { connect } from 'react-redux';

import { DetailAction, DetailSelector } from '~features';

import { Download, Email } from '~presentation/icons';
import { SensorDetailActionBarLayout } from '~layouts';
import { ExportDataModal, WritingLogsModal } from './modal';
import { IconButton } from './buttons';
import { DateRangeFilter } from './DateRangeFilter';

const stateToProps = state => {
  const { from, to } = DetailSelector.fromTo(state);
  const { possibleFrom, possibleTo } = DetailSelector.possibleFromTo(state);
  const fromToRange = DetailSelector.fromToRange(state);
  const isLoading = DetailSelector.isLoading(state);
  return { fromToRange, possibleFrom, possibleTo, from, to, isLoading };
};

const dispatchToProps = dispatch => {
  const updateDateRange = (from, to) => dispatch(DetailAction.updateDateRange(from, to));
  return { updateDateRange };
};

export const SensorDetailActionBarComponent = ({
  id,
  isLoading,
  fromToRange,
  possibleFrom,
  possibleTo,
  updateDateRange,
}) => {
  const [exportModalVariant, setExportModalVariant] = useState(null);

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
          // eslint-disable-next-line react/jsx-wrap-multilines
          <>
            <IconButton Icon={<Download />} onPress={() => setExportModalVariant('export')} />
            <IconButton Icon={<Email />} onPress={() => setExportModalVariant('email')} />
          </>
        }
      />
      <WritingLogsModal />
      <ExportDataModal
        id={id}
        variant={exportModalVariant}
        isOpen={!!exportModalVariant}
        onClose={() => setExportModalVariant(null)}
        onConfirm={() => setExportModalVariant(null)}
      />
    </>
  );
};

export const SensorDetailActionBar = connect(
  stateToProps,
  dispatchToProps
)(SensorDetailActionBarComponent);
