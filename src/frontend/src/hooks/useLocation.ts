import { useEffect, useState } from "react";

export interface LocationState {
  lat: number;
  lng: number;
  city: string;
  loading: boolean;
  error: string | null;
}

const MECCA = { lat: 21.3891, lng: 39.8579 };

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Try to use the browser's timezone as a city hint first (offline-safe)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const parts = tz.split("/");
      if (parts.length >= 2) {
        return parts[parts.length - 1].replace(/_/g, " ");
      }
    }
  } catch {}
  return `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    lat: MECCA.lat,
    lng: MECCA.lng,
    city: "Getting location...",
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for cached location first
    const cached = localStorage.getItem("mawaqit_location");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as {
          lat: number;
          lng: number;
          city: string;
          ts: number;
        };
        // Use cached if less than 6 hours old
        if (Date.now() - parsed.ts < 6 * 3600 * 1000) {
          setState({
            lat: parsed.lat,
            lng: parsed.lng,
            city: parsed.city,
            loading: false,
            error: null,
          });
        }
      } catch {}
    }

    if (!navigator.geolocation) {
      void reverseGeocode(MECCA.lat, MECCA.lng).then(() => {
        setState({
          lat: MECCA.lat,
          lng: MECCA.lng,
          city: "Mecca (Default)",
          loading: false,
          error: "Geolocation not supported",
        });
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const city = await reverseGeocode(lat, lng);
        const data = { lat, lng, city, ts: Date.now() };
        localStorage.setItem("mawaqit_location", JSON.stringify(data));
        setState({ lat, lng, city, loading: false, error: null });
      },
      (err) => {
        const cached = localStorage.getItem("mawaqit_location");
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as {
              lat: number;
              lng: number;
              city: string;
            };
            setState({ ...parsed, loading: false, error: null });
            return;
          } catch {}
        }
        reverseGeocode(MECCA.lat, MECCA.lng).then(() => {
          setState({
            lat: MECCA.lat,
            lng: MECCA.lng,
            city: "Mecca (Default)",
            loading: false,
            error: err.message,
          });
        });
      },
      { timeout: 10000, maximumAge: 3600000, enableHighAccuracy: false },
    );
  }, []);

  return state;
}
