package com.hotspotmanager.hotspot

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HotspotManagerModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val blockedDevices = mutableSetOf<String>()

  override fun getName(): String = "HotspotManager"

  @ReactMethod
  fun getCapabilities(promise: Promise) {
    val map = Arguments.createMap().apply {
      putBoolean("canToggleHotspot", false)
      putBoolean("canListClients", true)
      putBoolean("canBlockClients", true)
    }
    promise.resolve(map)
  }

  @ReactMethod
  fun getConnectedDevices(promise: Promise) {
    val devices = Arguments.createArray()

    val first = Arguments.createMap().apply {
      putString("id", "00:11:22:33:AA:01")
      putString("displayName", "Phone - Ada")
      putString("ipAddress", "192.168.43.20")
      putBoolean("blocked", blockedDevices.contains("00:11:22:33:AA:01"))
      putDouble("lastSeenAt", System.currentTimeMillis().toDouble())
    }

    val second = Arguments.createMap().apply {
      putString("id", "00:11:22:33:AA:02")
      putString("displayName", "Laptop - Tobi")
      putString("ipAddress", "192.168.43.21")
      putBoolean("blocked", blockedDevices.contains("00:11:22:33:AA:02"))
      putDouble("lastSeenAt", System.currentTimeMillis().toDouble())
    }

    devices.pushMap(first)
    devices.pushMap(second)
    promise.resolve(devices)
  }

  @ReactMethod
  fun blockDevice(deviceId: String, promise: Promise) {
    blockedDevices.add(deviceId)
    promise.resolve(true)
  }

  @ReactMethod
  fun unblockDevice(deviceId: String, promise: Promise) {
    blockedDevices.remove(deviceId)
    promise.resolve(true)
  }

  @ReactMethod
  fun setHotspotEnabled(enabled: Boolean, promise: Promise) {
    promise.resolve(false)
  }
}
