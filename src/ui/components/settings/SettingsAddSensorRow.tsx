import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useToggle } from '../../hooks';
import { SettingsItem } from './SettingsItem';
import { SettingsAddSensorModal } from './SettingsAddSensorModal';
import { ProgramAction, BlinkAction } from '../../../features/Bluetooth';

import { ConnectingWithSensorModal } from '../modal';
import { UnixTimestamp } from '~common/types/common';

interface SettingsAddSensorRowProps {
  macAddress: string;
}

export const SettingsAddSensorRow: FC<SettingsAddSensorRowProps> = ({ macAddress }) => {
  const [isModalOpen, toggleModal] = useToggle(false);
  const dispatch = useDispatch();

  const onConfirm = (date: UnixTimestamp) => {
    toggleModal();
    dispatch(ProgramAction.tryProgramNewSensor(macAddress, date));
  };

  const onBlink = () => dispatch(BlinkAction.tryBlinkSensor(macAddress));

  return (
    <>
      <SettingsItem label={macAddress} onPress={toggleModal} />
      {isModalOpen && (
        <SettingsAddSensorModal
          onClose={toggleModal}
          macAddress={macAddress}
          isOpen={isModalOpen}
          onBlink={onBlink}
          onConfirm={onConfirm}
        />
      )}
      <ConnectingWithSensorModal macAddress={macAddress} />
    </>
  );
};
