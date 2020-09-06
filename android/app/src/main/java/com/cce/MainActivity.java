package com.cce;

// Used for overriding onCreate
import android.os.Bundle;

// Used to create the splash screen on start up.
import expo.modules.splashscreen.SplashScreen;
import expo.modules.splashscreen.SplashScreenImageResizeMode;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "cce";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // SplashScreen.show(...) has to be called after super.onCreate(...)
    SplashScreen.show(this, SplashScreenImageResizeMode.COVER, false);
  }


}
