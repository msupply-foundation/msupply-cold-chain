package com.msupplycoldchain;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class SchedulerEventService extends HeadlessJsTaskService {
    private static final long TASK_TIMEOUT_MS = 5000;

    @Nullable
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        return new HeadlessJsTaskConfig(
            "ColdchainScheduler",
            extras != null ? Arguments.fromBundle(extras) : Arguments.createMap(),
            TASK_TIMEOUT_MS,
            true);
    }
}
