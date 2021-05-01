import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useToggle } from '../../hooks';
import { SettingsItem } from './SettingsItem';
import { SettingsAddSensorModal } from './SettingsAddSensorModal';
import { ProgramAction, BlinkAction } from '../../../features/Bluetooth';

import { ConnectingWithSensorModal } from '../modal';

interface SettingsAddSensorRowProps {
  macAddress: string;
}

export const SettingsAddSensorRow: FC<SettingsAddSensorRowProps> = ({ macAddress }) => {
  const [isModalOpen, toggleModal] = useToggle(false);
  const dispatch = useDispatch();

  const onConfirm = (date: Date) => {
    toggleModal();
    dispatch(
      ProgramAction.tryProgramNewSensor(macAddress, Math.ceil(new Date(date).getTime() / 1000))
    );
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
