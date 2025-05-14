package com.msupplycoldchain;

import static androidx.core.content.ContextCompat.getSystemService;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;

import java.util.UUID;

public class BluetoothGattConnection {
    static final String LOG_COMMAND = "*logall";
    static final UUID UUID_CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    static final UUID UUID_UART_SERVICE = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    static final UUID UUID_DEVICE_COMMAND_CHARACTERISTIC = UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
    static final UUID UUID_DEVICE_RESPONSE_CHARACTERISTIC = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e");

    String deviceAddress;
    private BluetoothAdapter bluetoothAdapter;
    private Context context;
    BluetoothGattCharacteristic writeCommandCharacteristic = null;
    BluetoothGattCharacteristic readCommandCharacteristic = null;

    public BluetoothGattConnection(Context context, String deviceAddress) {
        this.deviceAddress = deviceAddress;
        this.context = context;
        BluetoothManager bluetoothManager = getSystemService(this.context, BluetoothManager.class);
        if (bluetoothManager != null) {
            this.bluetoothAdapter = bluetoothManager.getAdapter();
        }
    }

    public void FetchLogs() {
        if (bluetoothAdapter == null) {
            // TODO: Better error handling
            return;
        }
        final BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);
        final BluetoothGatt gatt = device.connectGatt(context, false, callback);
    }

    private final BluetoothGattCallback callback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gattDevice, int status, int newState) {
            super.onConnectionStateChange(gattDevice, status, newState);
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                if (writeCommandCharacteristic == null || readCommandCharacteristic == null) {
                    gattDevice.discoverServices();
                } else {
                    writeLogAllRequest(gattDevice);
                }
            }
        }

        @Override
        // TODO: This is deprecated in later API versions
        public void onCharacteristicChanged(BluetoothGatt gattDevice, BluetoothGattCharacteristic characteristic) {
            super.onCharacteristicChanged(gattDevice, characteristic);

            BluetoothScanEventService.sendEvent(context, gattDevice.getDevice().getAddress(), "LOGALL_RECEIVE", characteristic.getValue());
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gattDevice, int status) {
            super.onServicesDiscovered(gattDevice, status);
            BluetoothGattService service = gattDevice.getService(UUID_UART_SERVICE);
            writeCommandCharacteristic = service.getCharacteristic(UUID_DEVICE_COMMAND_CHARACTERISTIC);
            readCommandCharacteristic = service.getCharacteristic(UUID_DEVICE_RESPONSE_CHARACTERISTIC);
            writeLogAllRequest(gattDevice);
        }
        @Override
        public void onCharacteristicWrite(BluetoothGatt gattDevice, BluetoothGattCharacteristic characteristic, int status) {
            super.onCharacteristicWrite(gattDevice, characteristic, status);
            readLogAllRequest(gattDevice);
        }

        public void writeLogAllRequest(BluetoothGatt gattDevice) {
            if (writeCommandCharacteristic != null) {
                // TODO: This gets deprecated in later API versions
                writeCommandCharacteristic.setValue(LOG_COMMAND.getBytes());
                gattDevice.writeCharacteristic(writeCommandCharacteristic);
            }
        }

        public void readLogAllRequest(BluetoothGatt gattDevice) {
            if (readCommandCharacteristic != null) {
                gattDevice.setCharacteristicNotification(readCommandCharacteristic, true);
                BluetoothGattDescriptor descriptor = readCommandCharacteristic.getDescriptor(UUID_CCCD);
                descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                gattDevice.writeDescriptor(descriptor);
            }
        }
    };
}
