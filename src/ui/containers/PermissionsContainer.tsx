import React, { useMemo, useEffect, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DeviceServiceModal } from '../presentation';
import { Location, Bluetooth, Storage } from '../presentation/icons';
import { PermissionAction, PermissionSelector } from '../../features/Permission';

export const PermissionsContainer: FC = ({ children }) => {
  const showLocationServicesModal = useSelector(PermissionSelector.showLocationServicesModal);
  const showBluetoothModal = useSelector(PermissionSelector.showBluetoothModal);
  const showLocationPermissionModal = useSelector(PermissionSelector.showLocationPermissionModal);
  const showStoragePermissionModal = useSelector(PermissionSelector.showStoragePermissionModal);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!__DEV__) {
      dispatch(PermissionAction.requestAndWatchPermissions());
    }
  }, []);

  const Modal = useMemo(() => {
    if (showLocationServicesModal) {
      return (
        <DeviceServiceModal
          isOpen={!showLocationServicesModal}
          onPress={async () => dispatch(PermissionAction.requestLocationServicesEnabled())}
          title="Enable Location Services"
          Icon={<Location />}
          body="Please enable location services for bluetooth to function"
        />
      );
    }
    if (showBluetoothModal) {
      return (
        <DeviceServiceModal
          isOpen={!showBluetoothModal}
          onPress={async () => dispatch(PermissionAction.requestBluetoothEnabled())}
          title="Enable Bluetooth"
          Icon={<Bluetooth />}
          body="Please enable bluetooth"
        />
      );
    }
    if (showLocationPermissionModal) {
      return (
        <DeviceServiceModal
          isOpen={!showLocationPermissionModal}
          onPress={async () => dispatch(PermissionAction.requestLocationPermission())}
          title="Grant Location Permission"
          Icon={<Location />}
          body="Please grant access to location permissions for bluetooth to function."
        />
      );
    }
    if (showStoragePermissionModal) {
      return (
        <DeviceServiceModal
          isOpen={!showStoragePermissionModal}
          onPress={async () => dispatch(PermissionAction.requestStoragePermission())}
          title="Grant Storage Permission"
          Icon={<Storage />}
          body="Please grant access to device storage."
        />
      );
    }

    return null;
  }, [
    showBluetoothModal,
    showLocationPermissionModal,
    showLocationServicesModal,
    showStoragePermissionModal,
  ]);

  return (
    <>
      {children}
      {Modal}
    </>
  );
};
