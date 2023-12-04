package com.msupplycoldchain;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class SchedulerEventService extends HeadlessJsTaskService {
    /*
     * prevents the task from running too long and consuming resources
     * the code spawned is async though, and is possible for a download
     * or integration task which takes longer than the timeout
     */
    private static final long TASK_TIMEOUT_MS = 30000;

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
