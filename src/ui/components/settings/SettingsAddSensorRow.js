/* eslint-disable react/jsx-wrap-multilines */
import { useDispatch } from 'react-redux';

import { useToggle } from '~hooks';
import { BluetoothStateActions } from '~bluetooth';
import { UpdateSensorAction } from '~bluetooth/bluetoothSlice';

import { SettingsItem } from './SettingsItem';
import { SettingsAddSensorModal } from './SettingsAddSensorModal';

export const SettingsAddSensorRow = ({ macAddress }) => {
  const [isModalOpen, toggleModal] = useToggle(false);
  const dispatch = useDispatch();

  const onPress = () => {
    toggleModal();
    dispatch(BluetoothStateActions.stopScanning());
  };

  const onCancel = () => {
    toggleModal();
    dispatch(BluetoothStateActions.findSensors());
  };

  const onConfirm = () => {
    toggleModal();
    dispatch(UpdateSensorAction.tryConnectWithNewSensor(macAddress));
  };

  const onBlink = () => dispatch(BluetoothStateActions.tryBlinkSensor(macAddress));

  return (
    <>
      <SettingsItem label={macAddress} onPress={onPress} />
      {isModalOpen && (
        <SettingsAddSensorModal
          onClose={onCancel}
          macAddress={macAddress}
          isOpen={isModalOpen}
          onBlink={onBlink}
          onConfirm={onConfirm}
        />
      )}
    </>
  );
};
