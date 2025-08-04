package com.msupplycoldchain;

import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BluetoothScannerModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    BluetoothScannerModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    public String getName() {
        return "BluetoothScannerModule";
    }

    @ReactMethod
    public void registerSensor(String sensorName, String sensorAddress) {
        BluetoothSensorRegistry.getInstance().registerSensor(sensorName, sensorAddress);
    }

    @ReactMethod
    public void deregisterSensor(String sensorAddress) {
        BluetoothSensorRegistry.getInstance().deregisterSensor(sensorAddress);
    }

    @ReactMethod
    public void setLogRequested(String sensorAddress) {
        BluetoothSensorRegistry.getInstance().setLogRequested(sensorAddress, true);
    }
    @ReactMethod
    public void setLogRequested(String sensorAddress, boolean requestLogs) {
        BluetoothSensorRegistry.getInstance().setLogRequested(sensorAddress, requestLogs);
    }

    @ReactMethod
    public void startService() {
        this.reactContext.startService(new Intent(this.reactContext, BluetoothScannerService.class));
    }
}
