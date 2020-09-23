package com.msupplycoldchain;

import android.app.Activity;

import com.msupplycoldchain.BleManager;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.JavaScriptModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SussolBlePackage implements ReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(
                              ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new BleManager(reactContext));

    return modules;
  }

  public List<Class<? extends JavaScriptModule>> createJSModules() { 
    return Collections.emptyList(); 
    }

}