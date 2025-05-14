package com.msupplycoldchain;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

import java.util.ArrayList;

public class BluetoothScannerService extends Service {
    public static final int SERVICE_NOTIFICATION_ID = 23456;
    private static final String CHANNEL_ID = "COLDCHAIN";
    private static final int ADVERT_SCAN_INTERVAL = 1000 * 60;
    private static final int ADVERT_SCAN_PERIOD = 1000 * 10;
    private Handler handler = new Handler();
    // TODO: Split bt scanner into new class?
    private BluetoothLeScanner scanner;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private final Runnable repeatableScan = new Runnable() {
        @Override
        public void run() {
            BluetoothScanEventService.sendEvent(getBaseContext(), "SENSORS_REQUEST");

            // Send a stop command when the period is over
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    scanner.stopScan(scannerCallback);
                }
            }, ADVERT_SCAN_PERIOD);

            ArrayList<ScanFilter> filterList = BluetoothSensorRegistry.getInstance().generateFilterList();
            ScanSettings settings = new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build();

            scanner.startScan(filterList, settings, scannerCallback);

            // Scan again after interval
            handler.postDelayed(this, ADVERT_SCAN_INTERVAL);
        }

    };

    private final ScanCallback scannerCallback =
            new ScanCallback() {
                public void onScanResult(int callbackType, ScanResult result) {
                    super.onScanResult(callbackType, result);

                    BluetoothScanEventService.sendEvent(getBaseContext(), result.getDevice().getAddress(), "ADVERT_RECEIVE", result.getScanRecord().getBytes());
                }
            };

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_ID, importance);
            channel.setDescription("Cold Chain Notification Channel");
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
    public static Notification buildNotification(Context context, String text) {
        Intent notificationIntent = new Intent(context, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);

        return new NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle("ColdChain service")
                .setContentText(text)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .build();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        this.handler.post(this.repeatableScan);
        createNotificationChannel();
        startForeground(SERVICE_NOTIFICATION_ID, buildNotification(this, "Starting..."));
        return START_STICKY;
    }
}
