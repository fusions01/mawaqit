import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { useServiceWorker } from "../hooks/useServiceWorker";
import { playAdhan } from "../utils/adhan";
import {
  type CalculationMethod,
  type PrayerTimes,
  calcPrayerTimes,
  formatCountdown,
  formatTime,
  getNextPrayer,
  gregorianToHijri,
} from "../utils/prayerTimes";

interface HomeTabProps {
  method: CalculationMethod;
  adhanEnabled: boolean;
  notificationsEnabled: boolean;
  adjustments: Record<string, number>;
}

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const PRAYER_ICONS = [Sunrise, Sun, Sun, Sunset, Moon];
const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

const HIJRI_MONTHS_SHORT = [
  "Muh.",
  "Saf.",
  "Rab. I",
  "Rab. II",
  "Jum. I",
  "Jum. II",
  "Raj.",
  "Sha.",
  "Ram.",
  "Shaw.",
  "Dhul Q.",
  "Dhul H.",
];

export default function HomeTab({
  method,
  adhanEnabled,
  notificationsEnabled,
  adjustments,
}: HomeTabProps) {
  const location = useLocation();
  const { scheduleAdhan } = useServiceWorker();
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: Date;
    index: number;
  } | null>(null);
  const [countdown, setCountdown] = useState("");
  const [now, setNow] = useState(new Date());
  const [lastPlayedPrayer, setLastPlayedPrayer] = useState<string | null>(null);

  // Calculate prayer times
  useEffect(() => {
    if (location.loading) return;
    const today = new Date();
    const prayerTimes = calcPrayerTimes(
      location.lat,
      location.lng,
      today,
      method,
    );
    setTimes(prayerTimes);
  }, [location.lat, location.lng, location.loading, method]);

  // Schedule background notifications
  useEffect(() => {
    if (!times || !notificationsEnabled) return;
    const schedule = PRAYER_KEYS.map((key, i) => {
      const t = times[key];
      const adj = (adjustments[key] || 0) * 60000;
      return { name: PRAYER_NAMES[i], timestamp: t.getTime() + adj };
    });
    scheduleAdhan(schedule);
  }, [times, notificationsEnabled, adjustments, scheduleAdhan]);

  // Countdown & adhan trigger
  useEffect(() => {
    if (!times) return;
    const interval = setInterval(() => {
      const n = new Date();
      setNow(n);
      const next = getNextPrayer(times, adjustments);
      setNextPrayer(next);
      if (next) {
        const ms = next.time.getTime() - n.getTime();
        setCountdown(formatCountdown(ms));

        // Check if prayer time just arrived (within 30 seconds)
        if (
          ms > -30000 &&
          ms <= 0 &&
          adhanEnabled &&
          lastPlayedPrayer !== next.name
        ) {
          setLastPlayedPrayer(next.name);
          playAdhan().catch(() => {});
        }
      } else {
        setCountdown("--:--:--");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [times, adjustments, adhanEnabled, lastPlayedPrayer]);

  // Initial next prayer calc
  useEffect(() => {
    if (!times) return;
    const next = getNextPrayer(times, adjustments);
    setNextPrayer(next);
    if (next) {
      setCountdown(formatCountdown(next.time.getTime() - Date.now()));
    }
  }, [times, adjustments]);

  const hijri = gregorianToHijri(now);
  const gregorianStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getPrayerTime = useCallback(
    (key: (typeof PRAYER_KEYS)[number]): Date | null => {
      if (!times) return null;
      const adj = (adjustments[key] || 0) * 60000;
      return new Date(times[key].getTime() + adj);
    },
    [times, adjustments],
  );

  return (
    <section data-ocid="home.section" className="flex flex-col gap-4 p-4 pb-24">
      {/* Header: Date */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-2"
      >
        <div className="flex items-center justify-center gap-2 text-islamic-gold mb-1">
          <Moon className="w-4 h-4" />
          <span className="font-display font-semibold text-lg">
            {hijri.day} {HIJRI_MONTHS_SHORT[hijri.month - 1]} {hijri.year} AH
          </span>
        </div>
        <p className="text-muted-foreground text-sm">{gregorianStr}</p>

        {/* Location */}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-sm">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {location.loading ? (
            <Skeleton className="h-4 w-32 bg-islamic-surface-2" />
          ) : (
            <span className="text-foreground/80">{location.city}</span>
          )}
        </div>
      </motion.div>

      {/* Next Prayer Card */}
      <AnimatePresence mode="wait">
        {nextPrayer ? (
          <motion.div
            key={nextPrayer.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            data-ocid="home.next_prayer.card"
            className="geo-border rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.08 155), oklch(0.18 0.06 145))",
            }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Next Prayer
                  </p>
                  <h2 className="font-display text-3xl font-semibold text-foreground mt-0.5">
                    {nextPrayer.name}
                  </h2>
                </div>
                <Badge
                  variant="outline"
                  className="text-islamic-gold border-islamic-gold/40 bg-islamic-gold/10 text-sm px-3 py-1"
                >
                  {formatTime(nextPrayer.time)}
                </Badge>
              </div>

              {/* Countdown */}
              <div
                data-ocid="home.countdown.panel"
                className="text-center py-3"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Time Remaining
                </p>
                <div className="font-display text-5xl font-bold tracking-wider text-islamic-gold tabular-nums">
                  {countdown}
                </div>
              </div>

              {/* Progress bar */}
              {times && (
                <div className="mt-3">
                  {(() => {
                    const prayers = PRAYER_KEYS.map((k, i) => ({
                      name: PRAYER_NAMES[i],
                      time: getPrayerTime(k)!,
                    })).filter((p) => p.time !== null);
                    const nextIdx = prayers.findIndex(
                      (p) => p.name === nextPrayer.name,
                    );
                    const prevTime =
                      nextIdx > 0
                        ? prayers[nextIdx - 1].time
                        : prayers[prayers.length - 1].time;
                    const total =
                      nextPrayer.time.getTime() - prevTime.getTime();
                    const elapsed = Date.now() - prevTime.getTime();
                    const progress = Math.max(
                      0,
                      Math.min(100, (elapsed / total) * 100),
                    );
                    return (
                      <div className="h-1 rounded-full bg-islamic-surface-2 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg, oklch(0.42 0.14 155), oklch(0.72 0.16 85))",
                            width: `${progress}%`,
                          }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="home.next_prayer.card"
            className="rounded-2xl p-5 text-center"
            style={{ background: "oklch(0.18 0.06 155)" }}
          >
            <p className="text-muted-foreground">
              All prayers completed for today.
            </p>
            <p className="text-islamic-gold mt-1 font-display">
              Alhamdulillah 🌙
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prayer Times List */}
      <div data-ocid="home.prayer_times.list" className="flex flex-col gap-2">
        {PRAYER_KEYS.map((key, idx) => {
          const Icon = PRAYER_ICONS[idx];
          const prayerName = PRAYER_NAMES[idx];
          const prayerTime = getPrayerTime(key);
          const isNext = nextPrayer?.name === prayerName;
          const isPast = prayerTime ? prayerTime < now : false;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              data-ocid={`home.prayer.item.${idx + 1}`}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300 ${
                isNext
                  ? "prayer-active bg-islamic-green/10 border-islamic-gold/50"
                  : "border-border/50 bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isNext
                      ? "bg-islamic-gold/20"
                      : isPast
                        ? "bg-muted/30"
                        : "bg-islamic-green/20"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isNext
                        ? "text-islamic-gold"
                        : isPast
                          ? "text-muted-foreground"
                          : "text-primary"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`font-medium text-sm ${
                      isNext
                        ? "text-foreground"
                        : isPast
                          ? "text-muted-foreground"
                          : "text-foreground/90"
                    }`}
                  >
                    {prayerName}
                  </p>
                  {isNext && (
                    <p className="text-xs text-islamic-gold pulse-gentle">
                      Next prayer
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                {prayerTime ? (
                  <p
                    className={`font-display font-semibold tabular-nums ${
                      isNext
                        ? "text-islamic-gold text-lg"
                        : isPast
                          ? "text-muted-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {formatTime(prayerTime)}
                  </p>
                ) : (
                  <Skeleton className="h-5 w-20 bg-islamic-surface-2" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {location.loading && (
        <p
          data-ocid="home.loading_state"
          className="text-center text-muted-foreground text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Calculating prayer times...
          </span>
        </p>
      )}
    </section>
  );
}
