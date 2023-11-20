package com.msupplycoldchain;

import android.util.Log;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.io.IOException;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class SelfSignedCertClientFactory implements OkHttpClientFactory {
    private static final String TAG = "OkHttpClientFactory";
    private boolean isPrivate = false;
    @Override
    public OkHttpClient createNewNetworkModuleClient() {
        X509TrustManager standardTrustManager;
        try {
            standardTrustManager = getTrustManager();

            final TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        @Override
                        public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {
                        }
                        @Override
                        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                            if (chain == null) return;

                            for (X509Certificate certificate: chain) {
                                certificate.checkValidity();
                            }

                             if (isPrivate) return;

                            standardTrustManager.checkServerTrusted(chain, authType);
                        }
                        @Override
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return new java.security.cert.X509Certificate[]{};
                        }
                    }
            };
            // Install the all-trusting trust manager
            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            // Create an ssl socket factory with our all-trusting manager
            final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();
            OkHttpClient.Builder builder = new OkHttpClient.Builder()
                    .connectTimeout(0, TimeUnit.MILLISECONDS).readTimeout(0, TimeUnit.MILLISECONDS)
                    .writeTimeout(0, TimeUnit.MILLISECONDS).cookieJar(new ReactCookieJarContainer());
            builder.sslSocketFactory(sslSocketFactory, (X509TrustManager) trustAllCerts[0]);
            builder.addInterceptor(new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    Request request = chain.request();
                    // Test the host and see if this is a private IP i.e.
                    // - 127.0.0.1
                    // - 192.168.0.0 to 192.168.255.255
                    // - 10.0.0.0 to 10.255.255.255
                    // - 172.16.0.0 to 172.31.255.255
                    Pattern pattern = Pattern.compile("(^127\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$)|(^10\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$)|(^172\\.1[6-9]{1}[0-9]{0,1}\\.[0-9]{1,3}\\.[0-9]{1,3}$)|(^172\\.2[0-9]{1}[0-9]{0,1}\\.[0-9]{1,3}\\.[0-9]{1,3}$)|(^172\\.3[0-1]{1}[0-9]{0,1}\\.[0-9]{1,3}\\.[0-9]{1,3}$)|(^192\\.168\\.[0-9]{1,3}\\.[0-9]{1,3}$)", Pattern.CASE_INSENSITIVE);
                    Matcher matcher = pattern.matcher(request.url().host());
                    isPrivate = matcher.find();
                    // and proceed as normal with the request
                    Response response = chain.proceed(request);
                    return response;
                }
            });

            builder.hostnameVerifier(new HostnameVerifier() {
                @Override
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            });

             OkHttpClient okHttpClient = builder.build();
            return okHttpClient;
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    X509TrustManager getTrustManager() throws Exception {
        TrustManagerFactory tmf = TrustManagerFactory.getInstance("X509");
        tmf.init((KeyStore) null);
        TrustManager tms [] = tmf.getTrustManagers();

        /*
         * Iterate over the returned trust managers,
         * look for an instance of X509TrustManager
         * and return if found
         */
        for (TrustManager tm: tms) {
            if (tm instanceof X509TrustManager) {
                return (X509TrustManager) tm;
            }
        }
        throw new Exception("Couldn't initialize");
    }
}
