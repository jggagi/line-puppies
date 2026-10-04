import type { Trajectory } from "../types/appGraph";

export const trajectories: Trajectory[] = [
  {
    id: "traj-battery-health",
    name: "Verify Battery health",
    device: "Pixel 8",
    androidVersion: "Android 16",
    durationMs: 12000,
    steps: [
      {
        id: "step-0",
        timestampMs: 0,
        screenshotId: "sc-settings",
        nodeId: "settings",
      },
      {
        id: "step-1",
        timestampMs: 2000,
        screenshotId: "sc-settings",
        nodeId: "settings",
        edgeId: "settings->battery",
        action: { type: "tap", x: 0.5, y: 0.46, label: 'Tap "Battery"' },
      },
      {
        id: "step-2",
        timestampMs: 3200,
        screenshotId: "sc-battery",
        nodeId: "battery",
      },
      {
        id: "step-3",
        timestampMs: 5000,
        screenshotId: "sc-battery",
        nodeId: "battery",
        edgeId: "battery->battery-health",
        action: { type: "tap", x: 0.5, y: 0.62, label: 'Tap "Battery health"' },
      },
      {
        id: "step-4",
        timestampMs: 6200,
        screenshotId: "sc-battery-health",
        nodeId: "battery-health",
      },
      {
        id: "step-5",
        timestampMs: 8400,
        screenshotId: "sc-battery-health",
        nodeId: "battery-health",
        edgeId: "battery-health->diagnostics",
        action: { type: "tap", x: 0.5, y: 0.74, label: 'Tap "Open diagnostics"' },
      },
      {
        id: "step-6",
        timestampMs: 9600,
        screenshotId: "sc-battery-diagnostics",
        nodeId: "battery-diagnostics",
      },
    ],
  },
];
