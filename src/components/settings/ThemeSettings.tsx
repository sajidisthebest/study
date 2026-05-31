import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

const ACCENT_PRESETS = [
  { name: "Blue", value: "blue", hsl: "221 83% 53%" },
  { name: "Purple", value: "purple", hsl: "262 83% 58%" },
  { name: "Green", value: "green", hsl: "142 71% 45%" },
  { name: "Orange", value: "orange", hsl: "25 95% 53%" },
  { name: "Pink", value: "pink", hsl: "330 81% 60%" },
  { name: "Red", value: "red", hsl: "0 84% 60%" },
  { name: "Teal", value: "teal", hsl: "174 72% 40%" },
  { name: "Indigo", value: "indigo", hsl: "239 84% 67%" },
];

function getAccentBg(value: string): string {
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    red: "bg-red-500",
    teal: "bg-teal-500",
    indigo: "bg-indigo-500",
  };
  return colors[value] || "bg-blue-500";
}

function applyAccentColor(value: string) {
  const preset = ACCENT_PRESETS.find((p) => p.value === value);
  if (preset) {
    document.documentElement.style.setProperty("--accent-color", preset.hsl);
  } else {
    document.documentElement.style.setProperty("--accent-color", value);
  }
}

export function ThemeSettings() {
  const { theme, accentColor, setTheme, setAccentColor } = useSettingsStore();
  const [customHex, setCustomHex] = useState("");

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleAccentChange = (value: string) => {
    setAccentColor(value);
    applyAccentColor(value);
  };

  const modes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the appearance of your study system.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => (
            <Button
              key={mode.value}
              variant={theme === mode.value ? "default" : "outline"}
              className="flex flex-col items-center gap-1.5 h-auto py-3"
              onClick={() => handleThemeChange(mode.value)}
            >
              <mode.icon className="h-5 w-5" />
              <span className="text-xs">{mode.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Accent Color</label>
        <div className="grid grid-cols-4 gap-3">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-md border transition-all",
                accentColor === color.value
                  ? "border-foreground bg-muted"
                  : "border-transparent hover:bg-muted/50"
              )}
              onClick={() => handleAccentChange(color.value)}
            >
              <span className={cn("h-8 w-8 rounded-full", getAccentBg(color.value))} />
              <span className="text-xs text-muted-foreground">{color.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Custom hex (e.g. #ff6b35)"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="max-w-[200px]"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (customHex.trim()) {
                handleAccentChange(customHex.trim());
                setCustomHex("");
              }
            }}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Preview</label>
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
              English
            </Badge>
            <span className="text-xs text-muted-foreground">1st Paper</span>
          </div>
          <p className="text-sm font-medium">Complete essay on climate change</p>
          <p className="text-xs text-orange-500">Due: Tomorrow</p>
          <div className="flex gap-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              Urgent
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              Easy
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
