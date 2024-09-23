package com.msupplycoldchain;

// Used for overriding onCreate
import android.Manifest;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

import com.bugsnag.android.Bugsnag;

// Used to create the splash screen on start up.

import expo.modules.splashscreen.singletons.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactActivity;

import java.util.Map;

public class MainActivity extends ReactActivity {
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "mSupplyColdChain";
  }


  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
    Bugsnag.start(this);

    // SplashScreen.show(...) has to be called after super.onCreate(...)
    SplashScreen.show(this, SplashScreenImageResizeMode.COVER, ReactRootView.class, false);

    // Trigger the permission request
    String[] permissions;
    if(Build.VERSION.SDK_INT < 31){
        permissions = new String[]{
          Manifest.permission.ACCESS_FINE_LOCATION,
          Manifest.permission.WRITE_EXTERNAL_STORAGE,
          Manifest.permission.BLUETOOTH,
          Manifest.permission.BLUETOOTH_ADMIN,
        };
    }
    else{
        permissions = new String[]{
          Manifest.permission.ACCESS_FINE_LOCATION,
          Manifest.permission.BLUETOOTH_SCAN,
          Manifest.permission.BLUETOOTH_CONNECT,
          Manifest.permission.WRITE_EXTERNAL_STORAGE,
        };
    }
    requestPermissionLauncher.launch(permissions);
  }

  ActivityResultLauncher<String[]> requestPermissionLauncher = registerForActivityResult(
    new ActivityResultContracts.RequestMultiplePermissions(),
    new ActivityResultCallback<Map<String, Boolean>>() {
      @Override
      public void onActivityResult(Map<String, Boolean> result) {
          for (Map.Entry<String, Boolean> entry : result.entrySet()) {
              if (!entry.getValue()) {
                  Log.w("mSupplyColdChain", "Permission denied for  " + entry.getKey());
              }
          }
      }
    });
}


