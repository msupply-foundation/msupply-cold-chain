import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native';

import { COLOUR } from '~constants';
import { t } from '~translations';

import { LoadingModalLayout, FullScreenModal } from '~layouts';

import { LargeText } from '~presentation/typography';
import { Tick, Close } from '~presentation/icons';

export const UpdatingSensorModal = () => {
  const updatingModalToggle = useSelector(state => state.bluetooth.updateSensor.updatingSensor);
  const lastAttempt = useSelector(state => state.bluetooth.updateSensor.lastAttempt);

  const timer = useRef(null);
  const [updatingSensor, setUpdatingSensor] = useState(false);

  const Icon = lastAttempt ? <Tick /> : <Close />;
  // If the modal should be closing, set the state of the modal being open to closed
  // after a small amount of time. Show a Tick icon for a second in the meantime.
  useEffect(() => {
    if (updatingModalToggle) {
      setUpdatingSensor(true);
    }
    if (!updatingModalToggle && !timer.current) {
      timer.current = setTimeout(() => {
        setUpdatingSensor(false);
        timer.current = null;
      }, 1000);
    }
  }, [updatingModalToggle]);

  return (
    <FullScreenModal isOpen={updatingSensor}>
      <LoadingModalLayout
        LoadingIndicator={
          updatingModalToggle ? <ActivityIndicator size="large" color={COLOUR.PRIMARY} /> : Icon
        }
        Content={<LargeText>{updatingModalToggle ? t('UPDATING') : t('UPDATED')}</LargeText>}
      />
    </FullScreenModal>
  );
};
