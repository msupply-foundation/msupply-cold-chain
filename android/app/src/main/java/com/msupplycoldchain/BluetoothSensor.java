package com.msupplycoldchain;

public class BluetoothSensor {
    // TODO: Getters/setters is best practice
    public String deviceAddress;
    public boolean logsRequested;
    public BluetoothSensor(String address) {
        this.deviceAddress = address;
    }
}
