import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Info, Loader2, Save, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSaveSettings, useSettings } from "../hooks/useQueries";
import { requestNotificationPermission } from "../hooks/useServiceWorker";
import type { CalculationMethod } from "../utils/prayerTimes";

interface SettingsTabProps {
  onMethodChange: (method: CalculationMethod) => void;
  onAdhanChange: (enabled: boolean) => void;
  onNotificationsChange: (enabled: boolean) => void;
  adjustments: Record<string, number>;
  onAdjustmentsChange: (adjustments: Record<string, number>) => void;
}

const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const PRAYER_LABELS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const METHODS = [
  { value: "MWL", label: "Muslim World League (MWL)" },
  { value: "ISNA", label: "ISNA — North America" },
  { value: "UmmAlQura", label: "Umm Al-Qura — Saudi Arabia" },
  { value: "Karachi", label: "Karachi — Pakistan" },
  { value: "Egypt", label: "Egyptian General Authority" },
];

export default function SettingsTab({
  onMethodChange,
  onAdhanChange,
  onNotificationsChange,
  adjustments,
  onAdjustmentsChange,
}: SettingsTabProps) {
  const { data: settings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();

  const [method, setMethod] = useState<CalculationMethod>("MWL");
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setMethod((settings.calculationMethod as CalculationMethod) || "MWL");
      setAdhanEnabled(settings.adhanEnabled);
      setNotificationsEnabled(settings.notificationsEnabled);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync({
        calculationMethod: method,
        adhanEnabled,
        notificationsEnabled,
      });
      onMethodChange(method);
      onAdhanChange(adhanEnabled);
      onNotificationsChange(notificationsEnabled);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error(
          "Notification permission denied. Please allow notifications in your browser settings.",
        );
        return;
      }
    }
    setNotificationsEnabled(enabled);
  };

  const handleAdjustment = (key: string, value: number) => {
    const newAdj = { ...adjustments, [key]: value };
    onAdjustmentsChange(newAdj);
    localStorage.setItem("mawaqit_adjustments", JSON.stringify(newAdj));
  };

  return (
    <section
      data-ocid="settings.section"
      className="flex flex-col gap-4 p-4 pb-24"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your prayer experience
        </p>
      </motion.div>

      {isLoading ? (
        <div
          data-ocid="settings.loading_state"
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Calculation Method */}
          <div
            className="rounded-xl p-4 border border-border/50 space-y-3"
            style={{ background: "oklch(0.16 0.06 155)" }}
          >
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-islamic-gold">
              Prayer Calculation
            </h3>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Calculation Method
              </Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as CalculationMethod)}
              >
                <SelectTrigger
                  data-ocid="settings.method.select"
                  className="border-border/60 bg-card"
                  style={{ background: "oklch(0.20 0.06 155)" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.18 0.06 155)",
                    border: "1px solid oklch(0.28 0.07 150)",
                  }}
                >
                  {METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audio & Notifications */}
          <div
            className="rounded-xl p-4 border border-border/50 space-y-4"
            style={{ background: "oklch(0.16 0.06 155)" }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-islamic-gold">
              Adhan & Notifications
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Adhan Audio</Label>
                  <p className="text-xs text-muted-foreground">
                    Play adhan when app is open
                  </p>
                </div>
              </div>
              <Switch
                data-ocid="settings.adhan.switch"
                checked={adhanEnabled}
                onCheckedChange={setAdhanEnabled}
              />
            </div>

            <div
              className="h-px"
              style={{ background: "oklch(0.25 0.05 150)" }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <Bell className="w-4 h-4 text-islamic-gold" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-sm font-medium">
                    Background Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Alert when app is closed
                  </p>
                </div>
              </div>
              <Switch
                data-ocid="settings.notifications.switch"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>

            {/* Background adhan info */}
            <div
              className="flex items-start gap-2 rounded-lg p-3"
              style={{ background: "oklch(0.14 0.05 155 / 0.8)" }}
            >
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                To hear the adhan when the app is closed, enable Background
                Notifications above. The app will send a system notification at
                each prayer time via the browser's notification system — no
                internet required after first load.
              </p>
            </div>
          </div>

          {/* Time Adjustments */}
          <div
            className="rounded-xl p-4 border border-border/50 space-y-4"
            style={{ background: "oklch(0.16 0.06 155)" }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-islamic-gold">
              Time Adjustments (minutes)
            </h3>

            {PRAYER_KEYS.map((key, idx) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{PRAYER_LABELS[idx]}</Label>
                  <span className="text-sm font-mono text-islamic-gold min-w-[3ch] text-right">
                    {adjustments[key] > 0 ? "+" : ""}
                    {adjustments[key] || 0}
                  </span>
                </div>
                <Slider
                  data-ocid={`settings.${key}_adjust.input`}
                  min={-30}
                  max={30}
                  step={1}
                  value={[adjustments[key] || 0]}
                  onValueChange={([v]) => handleAdjustment(key, v)}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Save button */}
          <Button
            data-ocid="settings.save.button"
            onClick={handleSave}
            disabled={saveSettings.isPending}
            className="w-full gap-2 font-semibold py-6"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.42 0.14 155), oklch(0.38 0.13 150))",
              color: "white",
              border: "none",
            }}
          >
            {saveSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </>
      )}
    </section>
  );
}
