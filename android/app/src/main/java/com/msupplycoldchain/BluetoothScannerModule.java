package com.msupplycoldchain;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.ArrayList;
import java.util.Objects;

public class BluetoothScannerModule extends ReactContextBaseJavaModule {
    BluetoothScannerModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    public String getName() {
        return "BluetoothScannerModule";
    }

    public void registerSensor(String sensorAddress) {
        BluetoothSensorRegistry.getInstance().registerSensor(sensorAddress);
    }

    public void deregisterSensor(String sensorAddress) {
        BluetoothSensorRegistry.getInstance().deregisterSensor(sensorAddress);
    }

    public void setLogRequested(String sensorAddress) {
        BluetoothSensorRegistry.getInstance().setLogRequested(sensorAddress, true);
    }
    public void setLogRequested(String sensorAddress, boolean requestLogs) {
        BluetoothSensorRegistry.getInstance().setLogRequested(sensorAddress, requestLogs);
    }

    // TODO: Add scanner service startup functions
}
