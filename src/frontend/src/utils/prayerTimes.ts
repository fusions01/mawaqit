/**
 * Prayer Time Calculator - Inline implementation
 * Based on praytimes.org algorithm
 */

export type CalculationMethod =
  | "MWL"
  | "ISNA"
  | "UmmAlQura"
  | "Karachi"
  | "Egypt";

interface MethodParams {
  fajrAngle: number;
  ishaAngle?: number;
  ishaMinsAfterMaghrib?: number;
}

const METHODS: Record<CalculationMethod, MethodParams> = {
  MWL: { fajrAngle: 18, ishaAngle: 17 },
  ISNA: { fajrAngle: 15, ishaAngle: 15 },
  UmmAlQura: { fajrAngle: 18.5, ishaMinsAfterMaghrib: 90 },
  Karachi: { fajrAngle: 18, ishaAngle: 18 },
  Egypt: { fajrAngle: 19.5, ishaAngle: 17.5 },
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function fixAngle(deg: number): number {
  let result = deg - 360 * Math.floor(deg / 360);
  if (result < 0) result += 360;
  return result;
}

function fixHour(h: number): number {
  let result = h - 24 * Math.floor(h / 24);
  if (result < 0) result += 24;
  return result;
}

function julianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5
  );
}

function sunPosition(jd: number): { declination: number; equation: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(
    q + 1.915 * Math.sin(toRad(g)) + 0.02 * Math.sin(toRad(2 * g)),
  );
  const e = 23.439 - 0.00000036 * D;
  const RA =
    toDeg(
      Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L))),
    ) / 15;
  const eqt = q / 15 - fixHour(RA);
  const decl = toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L))));
  return { declination: decl, equation: eqt };
}

function computeMidDay(jd: number, lon: number): number {
  const { equation } = sunPosition(jd);
  return fixHour(12 - equation - lon / 15);
}

function sunAngleTime(
  jd: number,
  lat: number,
  lon: number,
  angle: number,
  direction: "ccw" | "cw",
): number {
  const { declination } = sunPosition(jd);
  const midDay = computeMidDay(jd, lon);
  const cosVal =
    (-Math.sin(toRad(angle)) -
      Math.sin(toRad(declination)) * Math.sin(toRad(lat))) /
    (Math.cos(toRad(declination)) * Math.cos(toRad(lat)));

  if (cosVal > 1 || cosVal < -1) {
    // Sun never reaches this angle - polar area fallback
    return direction === "ccw" ? 5 : 19;
  }

  const t = toDeg(Math.acos(cosVal)) / 15;
  return midDay + (direction === "ccw" ? -t : t);
}

function asrTime(
  jd: number,
  lat: number,
  lon: number,
  shadowFactor: number,
): number {
  const { declination } = sunPosition(jd);
  const midDay = computeMidDay(jd, lon);
  const angle = -toDeg(
    Math.atan(
      1 / (shadowFactor + Math.tan(toRad(Math.abs(lat - declination)))),
    ),
  );
  const cosVal =
    (-Math.sin(toRad(angle)) -
      Math.sin(toRad(declination)) * Math.sin(toRad(lat))) /
    (Math.cos(toRad(declination)) * Math.cos(toRad(lat)));

  if (cosVal > 1 || cosVal < -1) return 15;
  const t = toDeg(Math.acos(cosVal)) / 15;
  return midDay + t;
}

function hourToDate(hour: number, date: Date, timezone: number): Date {
  const h = fixHour(hour - timezone);
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export function calcPrayerTimes(
  lat: number,
  lng: number,
  date: Date,
  method: CalculationMethod = "MWL",
): PrayerTimes {
  const params = METHODS[method];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = julianDay(year, month, day);

  // Timezone offset in hours
  const timezone = -date.getTimezoneOffset() / 60;

  // Fajr (dawn)
  const fajrHour = sunAngleTime(jd, lat, lng, params.fajrAngle, "ccw");
  // Sunrise
  const sunriseHour = sunAngleTime(jd, lat, lng, 0.833, "ccw");
  // Dhuhr (solar noon)
  const dhuhrHour = computeMidDay(jd, lng);
  // Asr (Shafi'i: shadow length = 1, Hanafi = 2)
  const asrHour = asrTime(jd, lat, lng, 1);
  // Maghrib (sunset)
  const maghribHour = sunAngleTime(jd, lat, lng, 0.833, "cw");
  // Isha
  let ishaHour: number;
  if (params.ishaMinsAfterMaghrib !== undefined) {
    ishaHour = maghribHour + params.ishaMinsAfterMaghrib / 60;
  } else {
    ishaHour = sunAngleTime(jd, lat, lng, params.ishaAngle!, "cw");
  }

  return {
    fajr: hourToDate(fajrHour, date, timezone),
    sunrise: hourToDate(sunriseHour, date, timezone),
    dhuhr: hourToDate(dhuhrHour + 0.066667, date, timezone), // +4 min correction
    asr: hourToDate(asrHour, date, timezone),
    maghrib: hourToDate(maghribHour, date, timezone),
    isha: hourToDate(ishaHour, date, timezone),
  };
}

/**
 * Hijri date conversion (offline algorithm)
 */
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

export function gregorianToHijri(date: Date): HijriDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day Number
  const jd = julianDay(year, month, day);

  // Convert JD to Hijri
  const l = Math.floor(jd) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
    Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll =
    ll -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hMonth = Math.floor((24 * lll) / 709);
  const hDay = lll - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthName: HIJRI_MONTHS[hMonth - 1] || "Unknown",
  };
}

/**
 * Qibla direction calculation (great circle formula)
 */
export function calcQiblaDirection(lat: number, lng: number): number {
  const MECCA_LAT = 21.3891;
  const MECCA_LNG = 39.8579;

  const phiUser = toRad(lat);
  const phiMecca = toRad(MECCA_LAT);
  const deltaLng = toRad(MECCA_LNG - lng);

  const x = Math.cos(phiMecca) * Math.sin(deltaLng);
  const y =
    Math.cos(phiUser) * Math.sin(phiMecca) -
    Math.sin(phiUser) * Math.cos(phiMecca) * Math.cos(deltaLng);

  let bearing = toDeg(Math.atan2(x, y));
  bearing = (bearing + 360) % 360;
  return bearing;
}

/**
 * Format time as HH:MM
 */
export function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Get next prayer from now
 */
export function getNextPrayer(
  times: PrayerTimes,
  adjustments: Record<string, number> = {},
): { name: string; time: Date; index: number } | null {
  const prayers: Array<{ name: string; time: Date; index: number }> = [
    {
      name: "Fajr",
      time: new Date(times.fajr.getTime() + (adjustments.fajr || 0) * 60000),
      index: 0,
    },
    {
      name: "Dhuhr",
      time: new Date(times.dhuhr.getTime() + (adjustments.dhuhr || 0) * 60000),
      index: 1,
    },
    {
      name: "Asr",
      time: new Date(times.asr.getTime() + (adjustments.asr || 0) * 60000),
      index: 2,
    },
    {
      name: "Maghrib",
      time: new Date(
        times.maghrib.getTime() + (adjustments.maghrib || 0) * 60000,
      ),
      index: 3,
    },
    {
      name: "Isha",
      time: new Date(times.isha.getTime() + (adjustments.isha || 0) * 60000),
      index: 4,
    },
  ];

  const now = new Date();
  for (const p of prayers) {
    if (p.time > now) return p;
  }
  return null;
}

/**
 * Format countdown as HH:MM:SS
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
