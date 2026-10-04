export interface ScreenshotScene {
  sceneKey: string;
  label: string;
}

export const screenshotScenes: Record<string, ScreenshotScene> = {
  "settings-home": { sceneKey: "settings-home", label: "Settings home" },
  "battery-settings": { sceneKey: "battery-settings", label: "Battery" },
  "battery-health": { sceneKey: "battery-health", label: "Battery health" },
  "battery-diagnostics": {
    sceneKey: "battery-diagnostics",
    label: "Battery diagnostics",
  },
};
