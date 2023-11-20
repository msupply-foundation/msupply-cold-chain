package com.msupplycoldchain;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;

import okhttp3.OkHttpClient;

public class HttpClient extends ReactContextBaseJavaModule {

    private boolean isLocal;
    HttpClient(ReactApplicationContext context){
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "HttpClient";
    }

    public boolean getIsLocal() {
        return this.isLocal;
    }

    @ReactMethod
    public void setIsLocal(boolean isLocal) {
        this.isLocal = isLocal;
//        if (isLocal){
//            OkHttpClientProvider.setOkHttpClientFactory(new SelfSignedCertClientFactory());
//        } else {
//            OkHttpClientProvider.setOkHttpClientFactory(new HttpClientFactory());
//        }
    }
}

class HttpClientFactory implements OkHttpClientFactory {
    private static final String TAG = "HttpClientFactory";
    @Override
    public OkHttpClient createNewNetworkModuleClient() {
        try {
            OkHttpClient.Builder builder = OkHttpClientProvider.createClientBuilder();
            OkHttpClient okHttpClient = builder.build();
            return okHttpClient;
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
