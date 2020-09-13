/* eslint-disable react/jsx-wrap-multilines */
import { useDispatch } from 'react-redux';

import { useToggle } from '~hooks';

import { SettingsItem } from './SettingsItem';
import { SettingsAddSensorModal } from './SettingsAddSensorModal';
import { ProgramAction, BlinkAction } from '../../../features/Bluetooth';

import { ConnectingWithSensorModal } from '../ConnectingWithSensorModal';

export const SettingsAddSensorRow = ({ macAddress }) => {
  const [isModalOpen, toggleModal] = useToggle(false);
  const dispatch = useDispatch();

  const onConfirm = date => {
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
