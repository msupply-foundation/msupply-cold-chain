import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';

import { LoadingModalLayout, FullScreenModal } from '~layouts';

import { LargeText } from '~presentation/typography';
import { Tick, Close } from '~presentation/icons';

export const WritingLogsModal = () => {
  const writingLogsToggle = useSelector(state => state.device.isWriting);
  const path = useSelector(state => state.device.writtenPath);

  const timer = useRef(null);
  const [writingLogs, setWritingLogs] = useState(false);

  const Icon = path ? <Tick /> : <Close />;
  // If the modal should be closing, set the state of the modal being open to closed
  // after a small amount of time. Show a Tick icon for a second in the meantime.
  useEffect(() => {
    if (writingLogsToggle) {
      setWritingLogs(true);
    }
    if (!writingLogsToggle && !timer.current) {
      timer.current = setTimeout(() => {
        setWritingLogs(false);
        timer.current = null;
      }, 2000);
    }
  }, [writingLogsToggle]);

  return (
    <FullScreenModal isOpen={writingLogs}>
      <LoadingModalLayout
        LoadingIndicator={
          writingLogsToggle ? <ActivityIndicator size="large" color={COLOUR.PRIMARY} /> : Icon
        }
        Content={<LargeText>{writingLogsToggle ? 'WRITING...' : `Written to: ${path}`}</LargeText>}
      />
    </FullScreenModal>
  );
};
