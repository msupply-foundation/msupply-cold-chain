import { useMemo, useContext, useState, useEffect } from 'react';

import { DEPENDENCY } from '~constants';
import { useOnAppFocus } from '~hooks';

import { DependencyLocatorContext } from './DependencyContainer';
import { DeviceServiceModal } from '~presentation';
import { Location, Bluetooth, Storage } from '~presentation/icons';

export const DeviceSettingsContainer = ({ children }) => {
  const DependencyLocator = useContext(DependencyLocatorContext);
  const permissionService = DependencyLocator.get(DEPENDENCY.PERMISSION_SERVICE);

  const [isLocationOn, setIsLocationOn] = useState(false);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);

  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [hasDoneInitialPermissionRequests, setHasDoneInitialPermissionRequests] = useState(false);

  useEffect(() => {
    (async () => {
      setHasStoragePermission(await permissionService.hasStoragePermission());
      setHasLocationPermission(await permissionService.hasLocationPermission());
      setIsBluetoothOn(await permissionService.isBluetoothEnabled());
      setIsLocationOn(await permissionService.isLocationServicesEnabled());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!hasStoragePermission) {
        setHasStoragePermission(await permissionService.requestStoragePermission());
      }
      if (!hasLocationPermission) {
        setHasLocationPermission(await permissionService.requestLocationPermission());
      }
      if (!isLocationOn) {
        setIsLocationOn(await permissionService.requestLocationServicesEnabled());
      }
      if (!isBluetoothOn) {
        setIsBluetoothOn(await permissionService.enableBluetooth());
      }

      setHasDoneInitialPermissionRequests(true);
    })();
  }, []);

  useOnAppFocus(async () => {
    setHasLocationPermission(await permissionService.hasLocationPermission());
    setHasStoragePermission(await permissionService.hasStoragePermission());
  });

  useEffect(() => {
    permissionService.addFeatureListener('bluetooth', setIsBluetoothOn);
    permissionService.addFeatureListener('location', setIsLocationOn);
  }, []);

  const Modal = useMemo(() => {
    if (!isLocationOn) {
      return (
        <DeviceServiceModal
          isOpen={!isLocationOn}
          onPress={async () =>
            setIsLocationOn(await permissionService.requestLocationServicesEnabled())}
          title="Enable Location Services"
          Icon={<Location />}
          body="Please enable location services for bluetooth to function"
        />
      );
    }
    if (!isBluetoothOn) {
      return (
        <DeviceServiceModal
          isOpen={!isBluetoothOn}
          onPress={async () => setIsBluetoothOn(await permissionService.enableBluetooth())}
          title="Enable Bluetooth"
          Icon={<Bluetooth />}
          body="Please enable bluetooth"
        />
      );
    }
    if (!hasLocationPermission) {
      return (
        <DeviceServiceModal
          isOpen={!hasLocationPermission}
          onPress={async () =>
            setHasLocationPermission(await permissionService.requestLocationPermission())}
          title="Grant Location Permission"
          Icon={<Location />}
          body="Please grant access to location permissions for bluetooth to function."
        />
      );
    }
    if (!hasStoragePermission) {
      return (
        <DeviceServiceModal
          isOpen={!hasStoragePermission}
          onPress={async () =>
            setHasStoragePermission(await permissionService.requestStoragePermission())}
          title="Grant Storage Permission"
          Icon={<Storage />}
          body="Please grant access to device storage."
        />
      );
    }

    return null;
  }, [isLocationOn, isBluetoothOn, hasLocationPermission, hasStoragePermission]);

  return (
    <>
      {!!hasDoneInitialPermissionRequests && children}
      {!!hasDoneInitialPermissionRequests && Modal}
    </>
  );
};
