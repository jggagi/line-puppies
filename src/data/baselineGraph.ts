import type { AppGraph, AppNode, AppEdge, AppFlow } from "../types/appGraph";

const n = (node: AppNode): AppNode => node;

const nodes: AppNode[] = [
  n({
    id: "settings",
    type: "app",
    name: "Settings",
    description: "Android system settings root.",
    sourceRefs: [
      { file: "SettingsActivity.kt" },
      { file: "top_level_settings.xml" },
    ],
    runtimeRefs: [],
    screenshots: [{ id: "sc-settings", sceneKey: "settings-home", label: "Settings home" }],
    verificationStatus: "observed",
    changeType: "unchanged",
  }),

  // Network & internet
  node("network", "settings", "Network & internet", "screen", "Network & internet", [
    { file: "NetworkDashboardFragment.kt" },
    { file: "network_and_internet.xml" },
  ], "observed"),
  node("internet", "network", "Internet", "screen", "Wi-Fi and mobile data", [
    { file: "NetworkInternetSettings.kt" },
  ], "source-only"),
  node("sims", "network", "SIMs", "screen", "SIM card management", [
    { file: "SimSettingsActivity.kt" },
  ], "source-only"),
  node("airplane-mode", "network", "Airplane mode", "screen", "Toggle airplane mode", [
    { file: "AirplaneModePreferenceController.kt" },
  ], "observed"),
  node("hotspot", "network", "Hotspot & tethering", "screen", "Portable hotspot and tethering", [
    { file: "TetherSettings.kt" },
  ], "source-only"),
  node("vpn", "network", "VPN", "screen", "Virtual private network", [
    { file: "VpnSettings.kt" },
  ], "source-only"),

  // Connected devices, Apps, Notifications
  node("connected-devices", "settings", "Connected devices", "screen", "Bluetooth, pairing, devices", [
    { file: "ConnectedDevicesDashboardFragment.kt" },
  ], "observed"),
  node("apps", "settings", "Apps", "screen", "Application management", [
    { file: "AppDashboardFragment.kt" },
  ], "observed"),
  node("notifications", "settings", "Notifications", "screen", "Notification controls", [
    { file: "NotificationDashboardFragment.kt" },
  ], "source-only"),

  // Battery
  node("battery", "settings", "Battery", "screen", "Battery settings and usage", [
    { file: "BatteryDashboardFragment.kt" },
    { file: "battery_settings.xml" },
  ], "verified", [{ id: "sc-battery", sceneKey: "battery-settings", label: "Battery" }]),
  node("battery-usage", "battery", "Battery usage", "screen", "Per-app battery usage", [
    { file: "BatteryUsagePreferenceController.kt" },
  ], "observed"),
  node("battery-saver", "battery", "Battery Saver", "screen", "Battery saver preferences", [
    { file: "BatterySaverPreferenceController.kt" },
  ], "observed"),
  node("adaptive-battery", "battery", "Adaptive preferences", "screen", "Adaptive battery management", [
    { file: "AdaptiveBatteryPreferenceController.kt" },
  ], "source-only"),

  // Remaining categories
  node("storage", "settings", "Storage", "screen", "Device storage usage", [
    { file: "StorageDashboardFragment.kt" },
  ], "source-only"),
  node("sound", "settings", "Sound & vibration", "screen", "Volume and vibration", [
    { file: "SoundDashboardFragment.kt" },
  ], "source-only"),
  node("display", "settings", "Display", "screen", "Display settings", [
    { file: "DisplaySettings.kt" },
  ], "observed"),
  node("security", "settings", "Security & privacy", "screen", "Device security", [
    { file: "SecurityDashboardFragment.kt" },
  ], "source-only"),
  node("location", "settings", "Location", "screen", "Location access", [
    { file: "LocationSettings.kt" },
  ], "source-only"),
  node("accessibility", "settings", "Accessibility", "screen", "Accessibility services", [
    { file: "AccessibilitySettings.kt" },
  ], "source-only"),
  node("system", "settings", "System", "screen", "System preferences", [
    { file: "SystemDashboardFragment.kt" },
  ], "source-only"),
  node("about", "settings", "About phone", "screen", "Device information", [
    { file: "MyDeviceInfoFragment.kt" },
  ], "source-only"),
];

// Helper used above — define a compact screen node factory
function node(
  id: string,
  parentId: string,
  name: string,
  type: AppNode["type"],
  description: string,
  sourceRefs: AppNode["sourceRefs"],
  verificationStatus: AppNode["verificationStatus"],
  screenshots: AppNode["screenshots"] = [],
): AppNode {
  return {
    id,
    parentId,
    type,
    name,
    description,
    sourceRefs,
    runtimeRefs: [],
    screenshots,
    verificationStatus,
    changeType: "unchanged",
  };
}

const edges: AppEdge[] = [
  // Network children
  edge("settings->network", "settings", "network", "tap", "Tap Network & internet", 'text="Network & internet"', [{ file: "SettingsActivity.kt", line: 88 }], true, true),
  edge("network->internet", "network", "internet", "tap", "Tap Internet", 'text="Internet"', [{ file: "NetworkDashboardFragment.kt", line: 42 }], false, false),
  edge("network->sims", "network", "sims", "tap", "Tap SIMs", 'text="SIMs"', [{ file: "NetworkDashboardFragment.kt", line: 56 }], false, false),
  edge("network->airplane", "network", "airplane-mode", "toggle", "Toggle Airplane mode", 'text="Airplane mode"', [{ file: "NetworkDashboardFragment.kt", line: 64 }], true, true),
  edge("network->hotspot", "network", "hotspot", "tap", "Tap Hotspot & tethering", 'text="Hotspot & tethering"', [{ file: "NetworkDashboardFragment.kt", line: 70 }], false, false),
  edge("network->vpn", "network", "vpn", "tap", "Tap VPN", 'text="VPN"', [{ file: "NetworkDashboardFragment.kt", line: 78 }], false, false),

  // Top-level entries
  edge("settings->connected-devices", "settings", "connected-devices", "tap", "Tap Connected devices", 'text="Connected devices"', [{ file: "SettingsActivity.kt", line: 96 }], true, true),
  edge("settings->apps", "settings", "apps", "tap", "Tap Apps", 'text="Apps"', [{ file: "SettingsActivity.kt", line: 102 }], true, true),
  edge("settings->notifications", "settings", "notifications", "tap", "Tap Notifications", 'text="Notifications"', [{ file: "SettingsActivity.kt", line: 108 }], false, false),

  // Battery subtree
  edge("settings->battery", "settings", "battery", "tap", "Tap Battery", 'text="Battery"', [{ file: "SettingsActivity.kt", line: 114 }], true, true),
  edge("battery->battery-usage", "battery", "battery-usage", "tap", "Tap Battery usage", 'text="Battery usage"', [{ file: "BatteryDashboardFragment.kt", line: 48 }], true, true),
  edge("battery->battery-saver", "battery", "battery-saver", "tap", "Tap Battery Saver", 'text="Battery Saver"', [{ file: "BatteryDashboardFragment.kt", line: 56 }], true, true),
  edge("battery->adaptive-battery", "battery", "adaptive-battery", "tap", "Tap Adaptive preferences", 'text="Adaptive preferences"', [{ file: "BatteryDashboardFragment.kt", line: 64 }], false, false),

  // Remaining top-level
  edge("settings->storage", "settings", "storage", "tap", "Tap Storage", 'text="Storage"', [{ file: "SettingsActivity.kt", line: 120 }], false, false),
  edge("settings->sound", "settings", "sound", "tap", "Tap Sound & vibration", 'text="Sound & vibration"', [{ file: "SettingsActivity.kt", line: 126 }], false, false),
  edge("settings->display", "settings", "display", "tap", "Tap Display", 'text="Display"', [{ file: "SettingsActivity.kt", line: 132 }], true, true),
  edge("settings->security", "settings", "security", "tap", "Tap Security & privacy", 'text="Security & privacy"', [{ file: "SettingsActivity.kt", line: 138 }], false, false),
  edge("settings->location", "settings", "location", "tap", "Tap Location", 'text="Location"', [{ file: "SettingsActivity.kt", line: 144 }], false, false),
  edge("settings->accessibility", "settings", "accessibility", "tap", "Tap Accessibility", 'text="Accessibility"', [{ file: "SettingsActivity.kt", line: 150 }], false, false),
  edge("settings->system", "settings", "system", "tap", "Tap System", 'text="System"', [{ file: "SettingsActivity.kt", line: 156 }], false, false),
  edge("settings->about", "settings", "about", "tap", "Tap About phone", 'text="About phone"', [{ file: "SettingsActivity.kt", line: 162 }], false, false),
];

function edge(
  id: string,
  from: string,
  to: string,
  actionType: AppEdge["actionType"],
  action: string,
  selector: string,
  sourceRefs: AppEdge["sourceRefs"],
  observed: boolean,
  verified: boolean,
): AppEdge {
  return {
    id,
    from,
    to,
    actionType,
    action,
    selector,
    sourceRefs,
    observed,
    verified,
    changeType: "unchanged",
  };
}

const flows: AppFlow[] = [
  {
    id: "flow-battery-health",
    name: "Battery health",
    nodeIds: ["settings", "battery", "battery-health", "battery-health-healthy"],
    edgeIds: ["settings->battery", "battery->battery-health", "battery-health->healthy"],
  },
];

export const baselineGraph: AppGraph = {
  appId: "com.android.settings",
  name: "Android Settings",
  branch: "main",
  nodes,
  edges,
  flows,
};
