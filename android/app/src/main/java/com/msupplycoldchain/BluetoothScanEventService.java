package com.msupplycoldchain;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BluetoothScanEventService extends HeadlessJsTaskService {
    private static final long TASK_TIMEOUT = 30 * 1000;
    @Override
    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        return new HeadlessJsTaskConfig(
                "BluetoothScanEvent",
                extras != null ? Arguments.fromBundle(extras) : Arguments.createMap(),
                TASK_TIMEOUT,
                true);
    }

    static void sendEvent(Context context, String eventType) {
        sendEvent(context, null, eventType, null);
    }
    static void sendEvent(Context context, String deviceAddress, String eventType, byte[] data) {
        Intent reactServiceIntent = new Intent(context, BluetoothScanEventService.class);
        Bundle bundle = new Bundle();
        bundle.putString("event", eventType);
        if (deviceAddress != null) {
            bundle.putString("deviceAddress", deviceAddress);
        }
        if (data != null) {
            bundle.putByteArray("data", data);
        }
        context.startService(reactServiceIntent);
    }
}
