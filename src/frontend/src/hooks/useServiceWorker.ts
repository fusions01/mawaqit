import { useEffect, useRef } from "react";

interface PrayerSchedule {
  name: string;
  timestamp: number;
}

export function useServiceWorker() {
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          swRef.current = reg;
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });
    }
  }, []);

  const scheduleAdhan = (prayers: PrayerSchedule[]) => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active) {
        reg.active.postMessage({
          type: "SCHEDULE_ADHAN",
          prayers,
        });
      }
    });
  };

  return { scheduleAdhan };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}
