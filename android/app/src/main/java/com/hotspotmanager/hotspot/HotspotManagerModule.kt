package com.hotspotmanager.hotspot

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HotspotManagerModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val blockedDevices = mutableSetOf<String>()
  private var hotspotEnabled = true

  override fun getName(): String = "HotspotManager"

  private fun createControlResult(
    supported: Boolean,
    applied: Boolean,
    message: String,
  ) = Arguments.createMap().apply {
    putBoolean("supported", supported)
    putBoolean("applied", applied)
    putString("message", message)
  }

  private fun createDeviceMap(
    id: String,
    displayName: String,
    nickname: String,
    vendor: String,
    ipAddress: String,
    macAddress: String,
    trusted: Boolean,
    connectionCount: Int,
  ) = Arguments.createMap().apply {
    putString("id", id)
    putString("displayName", displayName)
    putString("nickname", nickname)
    putString("vendor", vendor)
    putString("ipAddress", ipAddress)
    putString("macAddress", macAddress)
    putBoolean("blocked", blockedDevices.contains(id))
    putBoolean("trusted", trusted)
    putString("policyStatus", if (blockedDevices.contains(id)) "blocked" else "normal")
    putDouble("firstSeenAt", (System.currentTimeMillis() - 86400000).toDouble())
    putDouble("lastSeenAt", System.currentTimeMillis().toDouble())
    putDouble("connectionCount", connectionCount.toDouble())
  }

  @ReactMethod
  fun getCapabilities(promise: Promise) {
    val map = Arguments.createMap().apply {
      putBoolean("canToggleHotspot", false)
      putBoolean("canListClients", true)
      putBoolean("canBlockClients", true)
      putBoolean("canRunBackgroundAutomation", false)
      putBoolean("canSendLocalNotifications", true)
      putBoolean("canEstimateUsage", true)
      putArray(
        "diagnostics",
        Arguments.createArray().apply {
          pushString("Native hotspot toggling is unavailable in this sample bridge.")
          pushString("Client listing and manual block states are simulated locally.")
        },
      )
    }
    promise.resolve(map)
  }

  @ReactMethod
  fun getConnectedDevices(promise: Promise) {
    val devices = Arguments.createArray()

    val first = createDeviceMap(
      id = "00:11:22:33:AA:01",
      displayName = "Phone - Ada",
      nickname = "Ada Phone",
      vendor = "Google",
      ipAddress = "192.168.43.20",
      macAddress = "00:11:22:33:AA:01",
      trusted = true,
      connectionCount = 8,
    )

    val second = createDeviceMap(
      id = "00:11:22:33:AA:02",
      displayName = "Laptop - Tobi",
      nickname = "Work Laptop",
      vendor = "Lenovo",
      ipAddress = "192.168.43.21",
      macAddress = "00:11:22:33:AA:02",
      trusted = false,
      connectionCount = 3,
    )

    devices.pushMap(first)
    devices.pushMap(second)
    promise.resolve(devices)
  }

  @ReactMethod
  fun getHotspotStatus(promise: Promise) {
    val map = Arguments.createMap().apply {
      putBoolean("enabled", hotspotEnabled)
      putInt("connectedDeviceCount", 2)
      putNull("sessionStartedAt")
      putDouble("lastRefreshedAt", System.currentTimeMillis().toDouble())
    }
    promise.resolve(map)
  }

  @ReactMethod
  fun blockDevice(deviceId: String, promise: Promise) {
    blockedDevices.add(deviceId)
    promise.resolve(createControlResult(true, true, "Block applied for $deviceId"))
  }

  @ReactMethod
  fun unblockDevice(deviceId: String, promise: Promise) {
    blockedDevices.remove(deviceId)
    promise.resolve(createControlResult(true, true, "Unblock applied for $deviceId"))
  }

  @ReactMethod
  fun setHotspotEnabled(enabled: Boolean, promise: Promise) {
    hotspotEnabled = enabled
    promise.resolve(
      createControlResult(
        supported = false,
        applied = false,
        message = "Hotspot toggling is not wired to the system in this sample build.",
      ),
    )
  }
}
