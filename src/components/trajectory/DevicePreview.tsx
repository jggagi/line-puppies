import { Smartphone } from "lucide-react";

interface SceneRow {
  label: string;
  value?: string;
  icon?: "battery" | "wifi" | "bluetooth" | "shield" | " wrench" | "info" | "storage" | "sound";
  highlight?: boolean;
  chevron?: boolean;
}

interface Scene {
  title: string;
  rows: SceneRow[];
  banner?: { text: string; tone: "ok" | "warn" };
  hero?: { title: string; subtitle: string; tone: "ok" | "warn" };
}

const scenes: Record<string, Scene> = {
  "settings-home": {
    title: "Settings",
    rows: [
      { label: "Network & internet", icon: "wifi", chevron: true },
      { label: "Connected devices", icon: "bluetooth", chevron: true },
      { label: "Apps", icon: "info", chevron: true },
      { label: "Notifications", icon: "sound", chevron: true },
      { label: "Battery", icon: "battery", chevron: true, highlight: true },
      { label: "Storage", icon: "storage", chevron: true },
    ],
  },
  "battery-settings": {
    title: "Battery",
    hero: { title: "96%", subtitle: "Battery level · est. 14 h left", tone: "ok" },
    rows: [
      { label: "Battery usage", value: "View details", icon: "info", chevron: true },
      { label: "Battery Saver", value: "Off", icon: "shield", chevron: true },
      { label: "Adaptive preferences", value: "On", icon: "info", chevron: true },
      { label: "Battery health", value: "Healthy", icon: "battery", chevron: true, highlight: true },
    ],
  },
  "battery-health": {
    title: "Battery health",
    banner: { text: "Battery is healthy", tone: "ok" },
    rows: [
      { label: "Capacity", value: "96% of design", icon: "info" },
      { label: "Estimated age", value: "20 months", icon: "info" },
      { label: "Condition", value: "Healthy", icon: "shield", highlight: true },
      { label: "Open diagnostics", value: "", icon: " wrench", chevron: true, highlight: true },
    ],
  },
  "battery-diagnostics": {
    title: "Battery diagnostics",
    banner: { text: "Diagnostics passed", tone: "ok" },
    rows: [
      { label: "Charge cycle", value: "284", icon: "info" },
      { label: "Health status", value: "GOOD", icon: "shield" },
      { label: "Temperature", value: "31.2 °C", icon: "info" },
      { label: "Voltage", value: "4.08 V", icon: "info" },
    ],
  },
};

function Row({ row }: { row: SceneRow }) {
  const iconColor = row.highlight
    ? "text-emerald-500"
    : "text-[var(--color-text-subtle)]";
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 ${
        row.highlight ? "bg-[var(--color-accent-soft)]" : ""
      }`}
    >
      <div className={`h-5 w-5 text-center text-xs ${iconColor}`}>·</div>
      <div className="flex-1 text-[12px] text-[var(--color-text)]">{row.label}</div>
      {row.value && (
        <div className="text-[11px] text-[var(--color-text-subtle)]">{row.value}</div>
      )}
      {row.chevron && (
        <div className="text-[var(--color-text-subtle)]">›</div>
      )}
    </div>
  );
}

export function DevicePreview({
  sceneKey,
  tap,
}: {
  sceneKey: string;
  tap?: { x: number; y: number; key: string } | null;
}) {
  const scene = scenes[sceneKey] ?? scenes["settings-home"];
  return (
    <div className="flex h-full items-center justify-center bg-[var(--color-bg-subtle)] p-4">
      <div className="relative">
        {/* Phone frame */}
        <div className="relative h-[420px] w-[208px] overflow-hidden rounded-[28px] border-[7px] border-zinc-800 bg-[var(--color-bg-elevated)] shadow-xl dark:border-zinc-900">
          {/* Status bar */}
          <div className="flex h-6 items-center justify-between px-4 text-[9px] text-[var(--color-text-muted)]">
            <span>9:41</span>
            <span className="font-semibold">{scene.title === "Settings" ? "" : ""}</span>
            <span className="flex items-center gap-1">
              <Smartphone size={8} />
              <span>96%</span>
            </span>
          </div>

          {/* Title bar */}
          <div className="flex items-center px-4 pb-1 pt-1">
            {scene.title !== "Settings" && (
              <span className="mr-2 text-[var(--color-accent)]">‹</span>
            )}
            <h3 className="text-[15px] font-medium text-[var(--color-text)]">
              {scene.title}
            </h3>
          </div>

          {/* Hero */}
          {scene.hero && (
            <div className="px-4 py-2">
              <div
                className={`text-3xl font-light ${
                  scene.hero.tone === "ok"
                    ? "text-emerald-500"
                    : "text-amber-500"
                }`}
              >
                {scene.hero.title}
              </div>
              <div className="text-[10px] text-[var(--color-text-subtle)]">
                {scene.hero.subtitle}
              </div>
            </div>
          )}

          {/* Banner */}
          {scene.banner && (
            <div
              className={`mx-4 mb-2 mt-1 rounded-lg px-3 py-1.5 text-[10px] font-medium ${
                scene.banner.tone === "ok"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {scene.banner.text}
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-[var(--color-border)]">
            {scene.rows.map((row, i) => (
              <Row key={i} row={row} />
            ))}
          </div>

          {/* Tap ripple */}
          {tap && (
            <span
              key={tap.key}
              className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-accent)]"
              style={{
                left: `${tap.x * 100}%`,
                top: `${tap.y * 100}%`,
                animation: "ripple 0.7s ease-out forwards",
              }}
            />
          )}
        </div>

        <style>{`
          @keyframes ripple {
            0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
            100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
