package com.msupplycoldchain;

// Used for overriding onCreate
import android.os.Bundle;
import android.os.PowerManager;

import com.bugsnag.android.Bugsnag;

// Used to create the splash screen on start up.

import expo.modules.splashscreen.singletons.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  String packageName = "mSupplyColdChain";
  PowerManager.WakeLock wakeLock;

  @Override
  protected String getMainComponentName() {
    return packageName;
  }


  @Override
  protected void onCreate(Bundle savedInstanceState) {
    PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
    this.wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, packageName + "::MyWakelockTag");
    this.wakeLock.acquire();

    super.onCreate(null);
    Bugsnag.start(this); 

    // SplashScreen.show(...) has to be called after super.onCreate(...)
    SplashScreen.show(this, SplashScreenImageResizeMode.COVER, ReactRootView.class, false);
  }

  @Override
  protected void onDestroy() {
    try {
      this.wakeLock.release();
    }
    catch(Exception e) {

    }
    super.onDestroy();
  }
}
