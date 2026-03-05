import { Toaster } from "@/components/ui/sonner";
import { BookOpen, Compass, Hand, Hash, Home, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import HadithTab from "./components/HadithTab";
import HomeTab from "./components/HomeTab";
import NamesTab from "./components/NamesTab";
import QiblaTab from "./components/QiblaTab";
import SettingsTab from "./components/SettingsTab";
import TasbihTab from "./components/TasbihTab";
import type { CalculationMethod } from "./utils/prayerTimes";

type Tab = "home" | "qibla" | "tasbih" | "names" | "hadith" | "settings";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  ocid: string;
}[] = [
  { id: "home", label: "Home", icon: Home, ocid: "nav.home.tab" },
  { id: "qibla", label: "Qibla", icon: Compass, ocid: "nav.qibla.tab" },
  { id: "tasbih", label: "Tasbih", icon: Hand, ocid: "nav.tasbih.tab" },
  { id: "names", label: "Names", icon: Hash, ocid: "nav.names.tab" },
  { id: "hadith", label: "Hadith", icon: BookOpen, ocid: "nav.hadith.tab" },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    ocid: "nav.settings.tab",
  },
];

function getInitialAdjustments(): Record<string, number> {
  try {
    const stored = localStorage.getItem("mawaqit_adjustments");
    if (stored) return JSON.parse(stored) as Record<string, number>;
  } catch {}
  return {};
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [method, setMethod] = useState<CalculationMethod>("MWL");
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, number>>(
    getInitialAdjustments,
  );
  const [prevTab, setPrevTab] = useState<Tab>("home");

  const handleTabChange = (tab: Tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const tabDirection =
    TABS.findIndex((t) => t.id === activeTab) >
    TABS.findIndex((t) => t.id === prevTab)
      ? 1
      : -1;

  useEffect(() => {
    // Restore settings from localStorage as fallback
    const storedMethod = localStorage.getItem(
      "mawaqit_method",
    ) as CalculationMethod | null;
    if (storedMethod) setMethod(storedMethod);

    const storedAdhan = localStorage.getItem("mawaqit_adhan");
    if (storedAdhan !== null) setAdhanEnabled(storedAdhan === "true");

    const storedNotif = localStorage.getItem("mawaqit_notif");
    if (storedNotif !== null) setNotificationsEnabled(storedNotif === "true");
  }, []);

  const handleMethodChange = (m: CalculationMethod) => {
    setMethod(m);
    localStorage.setItem("mawaqit_method", m);
  };

  const handleAdhanChange = (enabled: boolean) => {
    setAdhanEnabled(enabled);
    localStorage.setItem("mawaqit_adhan", String(enabled));
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem("mawaqit_notif", String(enabled));
  };

  return (
    <div
      className="min-h-screen flex flex-col max-w-lg mx-auto relative overflow-hidden"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* Islamic geometric top decoration */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.42 0.14 155), oklch(0.72 0.16 85), oklch(0.42 0.14 155))",
        }}
      />

      {/* App Header */}
      <header
        className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.12 0.04 155 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.22 0.06 155)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.42 0.14 155)" }}
          >
            <span className="text-sm">🕌</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none tracking-wide gold-gradient-text">
              Mawaqit
            </h1>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              مواقيت
            </p>
          </div>
        </div>

        {/* Active tab label */}
        <div className="text-xs text-muted-foreground capitalize">
          {activeTab === "names"
            ? "99 Names"
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: tabDirection * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tabDirection * -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {activeTab === "home" && (
              <HomeTab
                method={method}
                adhanEnabled={adhanEnabled}
                notificationsEnabled={notificationsEnabled}
                adjustments={adjustments}
              />
            )}
            {activeTab === "qibla" && <QiblaTab />}
            {activeTab === "tasbih" && <TasbihTab />}
            {activeTab === "names" && <NamesTab />}
            {activeTab === "hadith" && <HadithTab />}
            {activeTab === "settings" && (
              <SettingsTab
                onMethodChange={handleMethodChange}
                onAdhanChange={handleAdhanChange}
                onNotificationsChange={handleNotificationsChange}
                adjustments={adjustments}
                onAdjustmentsChange={setAdjustments}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer branding - small */}
      <div
        className="text-center py-1.5 text-xs text-muted-foreground/50 pb-20"
        style={{ borderTop: "1px solid oklch(0.20 0.05 150)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </div>

      {/* Bottom Navigation */}
      <nav
        className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-30"
        style={{
          background: "oklch(0.10 0.04 155 / 0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid oklch(0.22 0.06 155)",
        }}
      >
        <div className="flex items-center justify-around px-1 py-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={tab.ocid}
                onClick={() => handleTabChange(tab.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1 relative"
                style={
                  isActive
                    ? {
                        background: "oklch(0.22 0.08 155)",
                      }
                    : {}
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "oklch(0.22 0.08 155)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  className="w-5 h-5 relative z-10 transition-colors duration-200"
                  style={{
                    color: isActive
                      ? "oklch(0.72 0.16 85)"
                      : "oklch(0.50 0.06 140)",
                  }}
                />
                <span
                  className="text-xs relative z-10 transition-colors duration-200 leading-none"
                  style={{
                    color: isActive
                      ? "oklch(0.72 0.16 85)"
                      : "oklch(0.50 0.06 140)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.20 0.06 155)",
            border: "1px solid oklch(0.28 0.07 150)",
            color: "oklch(0.95 0.02 120)",
          },
        }}
      />
    </div>
  );
}
