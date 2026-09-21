package com.echospeak.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * EchoSpeak host activity.
 *
 * WHAT THIS CLASS DELIBERATELY DOES NOT DO
 *
 * It does not install a WebChromeClient, and it does not override
 * onPermissionRequest.
 *
 * Capacitor's BridgeWebChromeClient already overrides onPermissionRequest and
 * maps android.webkit.resource.AUDIO_CAPTURE to RECORD_AUDIO +
 * MODIFY_AUDIO_SETTINGS through its activity-result permission launcher
 * (see BridgeWebChromeClient.java:102-124 in @capacitor/android). Installing
 * our own chrome client would REPLACE Capacitor's and silently break the file
 * chooser, geolocation prompts and JS dialogs, while reimplementing a bridge
 * that already works.
 *
 * The previous version of this file declared a `pendingPermissionRequest`
 * field, null-checked it in onRequestPermissionsResult, and never assigned it
 * anywhere — because nothing installed a chrome client that could populate it.
 * That was dead code, and the mic bug it appeared to address was really the
 * missing SpeechRecognition API in Android System WebView (see ARCHITECTURE.md
 * section 0, Fact 1).
 *
 * What this activity DOES add is a small plugin that lets the web layer read
 * and request RECORD_AUDIO state explicitly, so it can render an accurate,
 * non-blocking permission UI and deep-link to app settings after a permanent
 * denial. Capacitor's bridge grants permission but does not tell JavaScript
 * *why* a request failed; getUserMedia alone cannot distinguish
 * "denied once" from "denied permanently, prompt suppressed".
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register before super.onCreate(): the bridge instantiates plugins
        // during its own onCreate, so a later call would be ignored.
        registerPlugin(MicPermissionPlugin.class);
        super.onCreate(savedInstanceState);
    }

    /**
     * Backgrounding must release the microphone.
     *
     * Android does not stop MediaStream tracks for a backgrounded WebView, so
     * without this the recording indicator stays in the status bar and the
     * device stays locked for other apps. speechController also listens for
     * visibilitychange; this is the native-side belt to that braces, and it
     * fires in cases where the WebView never reports a visibility change
     * (task switcher, screen off).
     */
    @Override
    public void onPause() {
        super.onPause();
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().evaluateJavascript(
                "window.echoSpeech && window.echoSpeech.reset('android-onPause');",
                null
            );
        }
    }
}
