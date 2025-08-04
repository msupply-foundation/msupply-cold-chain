package com.msupplycoldchain;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import java.util.ArrayList;

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

    static Bundle createBaseBundle(String eventType) {
        Bundle bundle = new Bundle();
        bundle.putString("event", eventType);
        return bundle;
    }
    static Bundle createDeviceBundle(String deviceAddress, String eventType) {
        Bundle bundle = createBaseBundle(eventType);
        // NOTE: The formatted macAddress is stored in the "name" field in sqlite
        // so we're calling it name when we pass to react
        bundle.putString("deviceName", deviceAddress);
        return bundle;
    }
    static void generateAndSendIntent(Context context, Bundle bundle) {
        Intent reactServiceIntent = new Intent(context, BluetoothScanEventService.class);
        reactServiceIntent.putExtras(bundle);
        context.startService(reactServiceIntent);
    }
    static void sendSensorRequest(Context context) {
        generateAndSendIntent(context, createBaseBundle("SENSORS_REQUEST"));
    }
    static void sendAdvertisementPacket(Context context, String deviceAddress, String data) {
        Bundle bundle = createDeviceBundle(deviceAddress, "ADVERT_RECEIVE");
        bundle.putString("data", data);
        generateAndSendIntent(context, bundle);
    }
    static void sendLogAllResults(Context context, String deviceAddress, ArrayList<String> data) {
        Bundle bundle = createDeviceBundle(deviceAddress, "LOGALL_RECEIVE");
        bundle.putStringArrayList("data", data);
        generateAndSendIntent(context, bundle);
    }
}
