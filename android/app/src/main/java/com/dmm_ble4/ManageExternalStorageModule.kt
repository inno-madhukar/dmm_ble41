package com.dmm_ble4

import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ManageExternalStorageModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ManageExternalStorage"
    }

    @ReactMethod
    fun hasPermission(promise: Promise) {
        val result = Environment.isExternalStorageManager()
        promise.resolve(result)
    }

    @ReactMethod
    fun requestPermission() {
        val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
        intent.data = Uri.parse("package:${reactApplicationContext.packageName}")
        currentActivity?.startActivity(intent)
    }
}
