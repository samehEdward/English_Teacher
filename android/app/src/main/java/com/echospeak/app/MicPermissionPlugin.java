package com.echospeak.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Exposes RECORD_AUDIO permission STATE to the web layer.
 *
 * Capacitor's BridgeWebChromeClient already grants the WebView's mic request,
 * so this plugin is not a permission bridge — it is a state oracle. The web
 * layer needs it because getUserMedia alone cannot distinguish:
 *
 *   - "not asked yet"            -> show an inviting prompt
 *   - "denied once"              -> re-requesting will show the OS dialog again
 *   - "denied with Don't ask"    -> re-requesting is a no-op; the ONLY route
 *                                   forward is the app settings screen
 *
 * Conflating the last two is what made v1 latch a permanent red error state
 * that survived the user granting permission in Android settings.
 *
 * States returned to JS match src/core/permissionGate.js MicPermission:
 *   "granted" | "denied" | "prompt"
 */
@CapacitorPlugin(
    name = "EchoMicPermission",
    permissions = {
        @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
    }
)
public class MicPermissionPlugin extends Plugin {

    private static final String STATE_GRANTED = "granted";
    private static final String STATE_DENIED  = "denied";
    private static final String STATE_PROMPT  = "prompt";

    private boolean isGranted() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * shouldShowRequestPermissionRationale() is false both before the first
     * ask and after a permanent denial. Combined with a "have we ever asked"
     * flag, that disambiguates the two.
     */
    private boolean isPermanentlyDenied() {
        if (isGranted()) return false;
        if (!hasAsked()) return false;
        return !ActivityCompat.shouldShowRequestPermissionRationale(
            getActivity(), Manifest.permission.RECORD_AUDIO);
    }

    private boolean hasAsked() {
        return getContext()
            .getSharedPreferences("echospeak_perm", android.content.Context.MODE_PRIVATE)
            .getBoolean("asked_record_audio", false);
    }

    private void markAsked() {
        getContext()
            .getSharedPreferences("echospeak_perm", android.content.Context.MODE_PRIVATE)
            .edit()
            .putBoolean("asked_record_audio", true)
            .apply();
    }

    private JSObject describe() {
        JSObject result = new JSObject();

        if (isGranted()) {
            result.put("state", STATE_GRANTED);
            result.put("canPrompt", false);
            result.put("permanentlyDenied", false);
            return result;
        }

        boolean permanent = isPermanentlyDenied();
        result.put("state", permanent ? STATE_DENIED : (hasAsked() ? STATE_DENIED : STATE_PROMPT));
        result.put("canPrompt", !permanent);
        result.put("permanentlyDenied", permanent);
        return result;
    }

    /** Non-invasive: never shows a dialog. */
    @PluginMethod
    public void check(PluginCall call) {
        call.resolve(describe());
    }

    /**
     * Ask for RECORD_AUDIO. Resolves with the resulting state; resolves rather
     * than rejects on denial, because a denial is an expected outcome the UI
     * must render, not an exception.
     */
    @PluginMethod
    public void request(PluginCall call) {
        if (isGranted()) {
            call.resolve(describe());
            return;
        }

        if (isPermanentlyDenied()) {
            // Requesting again would be a silent no-op. Tell the web layer to
            // offer the settings route instead of spinning.
            call.resolve(describe());
            return;
        }

        markAsked();
        requestPermissionForAlias("microphone", call, "micPermissionResult");
    }

    @PermissionCallback
    private void micPermissionResult(PluginCall call) {
        call.resolve(describe());
    }

    /**
     * Open this app's settings page so the user can reverse a permanent
     * denial. The web layer invalidates its permission cache on return.
     */
    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
            // No FLAG_ACTIVITY_NEW_TASK here: launching into a new task with
            // startActivityForResult makes the result fire back immediately,
            // before the user has actually visited the settings screen.
            startActivityForResult(call, intent, "settingsResult");
        } catch (Exception err) {
            call.reject("Could not open application settings", err);
        }
    }

    @ActivityCallback
    private void settingsResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        // The settings screen never reports a result code we can trust, so
        // just re-read the live permission state on return.
        call.resolve(describe());
    }
}
