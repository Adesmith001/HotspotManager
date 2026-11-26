package com.hotspotmanager.hotspot

import android.content.ActivityNotFoundException
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HotspotManagerModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  override fun getName(): String = "HotspotManager"

  @ReactMethod
  fun openNetworkSettings(promise: Promise) {
    val intent = Intent(Settings.ACTION_WIRELESS_SETTINGS)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      context.startActivity(intent)
      promise.resolve(true)
    } catch (_: ActivityNotFoundException) {
      promise.resolve(false)
    } catch (_: SecurityException) {
      promise.resolve(false)
    }
  }
}
