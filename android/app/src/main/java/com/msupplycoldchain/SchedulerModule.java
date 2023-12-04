package com.msupplycoldchain;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nonnull;

import static androidx.core.content.ContextCompat.getSystemService;
import static com.msupplycoldchain.SchedulerService.SERVICE_NOTIFICATION_ID;
import static com.msupplycoldchain.SchedulerService.buildNotification;

public class SchedulerModule extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "Scheduler";
    private static ReactApplicationContext reactContext;

    public SchedulerModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startService() {
        this.reactContext.startService(new Intent(this.reactContext, SchedulerService.class));
    }

    @ReactMethod
    public void stopService() {
        this.reactContext.stopService(new Intent(this.reactContext, SchedulerService.class));
    }

    @ReactMethod
    public void updateStatus(String status) {
        buildNotification(this.reactContext, status);
        NotificationManager mNotificationManager = (NotificationManager) this.reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        mNotificationManager.notify(SERVICE_NOTIFICATION_ID, buildNotification(this.reactContext, status));
    }
}