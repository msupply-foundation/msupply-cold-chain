package com.msupplycoldchain;

import android.bluetooth.le.ScanFilter;
import android.util.Log;

import java.util.ArrayList;
import java.util.Objects;

public class BluetoothSensorRegistry {
    // Singleton
    private static volatile BluetoothSensorRegistry instance;
    private static Object mutex = new Object();

    private ArrayList<BluetoothSensor> registeredSensors = new ArrayList<>();

    private BluetoothSensorRegistry() {}

    public static BluetoothSensorRegistry getInstance() {
        BluetoothSensorRegistry result = instance;
        if (result == null) {
            synchronized (mutex) {
                result = instance;
                if (result == null) {
                    instance = result = new BluetoothSensorRegistry();
                }
            }
        }
        return result;
    }

    // TODO: Return some actual statuses from these
    public void registerSensor(String sensorName, String sensorAddress) {
        if (findSensorEntry(sensorAddress) == -1) {
            // TODO: Validate address format
            registeredSensors.add(new BluetoothSensor(sensorName, sensorAddress));
        }
    }

    public void deregisterSensor(String sensorAddress) {
        int sensorIndex = findSensorEntry(sensorAddress);
        if (sensorIndex != -1) {
            registeredSensors.remove(sensorIndex);
        }
    }

    public void setLogRequested(String sensorAddress) {
        this.setLogRequested(sensorAddress, true);
    }
    public void setLogRequested(String sensorAddress, boolean requestLogs) {
        int sensorIndex = findSensorEntry(sensorAddress);
        if (sensorIndex != -1) {
            registeredSensors.get(sensorIndex).logsRequested = requestLogs;
        }
    }

    private int findSensorEntry(String sensorAddress) {
        for (int i = 0; i < registeredSensors.size(); ++i) {
            if (Objects.equals(registeredSensors.get(i).deviceAddress, sensorAddress)) {
                return i;
            }
        }
        return -1;
    }

    public ArrayList<ScanFilter> generateFilterList() {
        ArrayList<ScanFilter> filterList = new ArrayList<>();
        for (BluetoothSensor sensor: registeredSensors) {
            // Create filter
            filterList.add(new ScanFilter.Builder()
                    // NOTE: In sqlite the "macAddress" field of the sensor actually includes the sensor type.
                    // The "name" field is the properly formatted macAddress we need to use here
                    .setDeviceAddress(sensor.deviceName)
                    .build());
        }
        return filterList;
    }

    public ArrayList<BluetoothSensor> getRegisteredSensors() {
        return registeredSensors;
    }
}
