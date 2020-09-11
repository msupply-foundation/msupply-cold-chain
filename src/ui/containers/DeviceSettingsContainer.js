import { useMemo, useContext, useState, useEffect } from 'react';

import { SERVICES } from '~constants';
import { useOnAppFocus } from '~hooks';

import { ServiceLocatorContext } from './DependencyContainer';
import { DeviceServiceModal } from '~presentation';
import { Location, Bluetooth, Storage } from '~presentation/icons';

export const DeviceSettingsContainer = ({ children }) => {
  const DependencyLocator = useContext(ServiceLocatorContext);
  const deviceService = DependencyLocator.get(SERVICES.DEVICE);

  const [isLocationOn, setIsLocationOn] = useState(false);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);

  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [hasDoneInitialPermissionRequests, setHasDoneInitialPermissionRequests] = useState(false);

  useEffect(() => {
    (async () => {
      setHasStoragePermission(await deviceService.hasStoragePermission());
      setHasLocationPermission(await deviceService.hasLocationPermission());
      setIsBluetoothOn(await deviceService.isBluetoothEnabled());
      setIsLocationOn(await deviceService.isLocationServicesEnabled());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!hasStoragePermission) {
        setHasStoragePermission(await deviceService.requestStoragePermission());
      }
      if (!hasLocationPermission) {
        setHasLocationPermission(await deviceService.requestLocationPermission());
      }
      if (!isLocationOn) {
        setIsLocationOn(await deviceService.requestLocationServicesEnabled());
      }
      if (!isBluetoothOn) {
        setIsBluetoothOn(await deviceService.enableBluetooth());
      }

      setHasDoneInitialPermissionRequests(true);
    })();
  }, []);

  useOnAppFocus(async () => {
    setHasLocationPermission(await deviceService.hasLocationPermission());
    setHasStoragePermission(await deviceService.hasStoragePermission());
  });

  useEffect(() => {
    deviceService.addFeatureListener('bluetooth', setIsBluetoothOn);
    deviceService.addFeatureListener('location', setIsLocationOn);
  }, []);

  const Modal = useMemo(() => {
    if (!isLocationOn) {
      return (
        <DeviceServiceModal
          isOpen={!isLocationOn}
          onPress={async () =>
            setIsLocationOn(await deviceService.requestLocationServicesEnabled())}
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
          onPress={async () => setIsBluetoothOn(await deviceService.enableBluetooth())}
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
            setHasLocationPermission(await deviceService.requestLocationPermission())}
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
            setHasStoragePermission(await deviceService.requestStoragePermission())}
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
