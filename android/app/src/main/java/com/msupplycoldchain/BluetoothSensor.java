package com.msupplycoldchain;

public class BluetoothSensor {
    // TODO: Getters/setters is best practice
    public String deviceName;
    public String deviceAddress;
    public boolean logsRequested;
    public BluetoothSensor(String name, String address) {
        this.deviceName = name;
        this.deviceAddress = address;
    }
}
