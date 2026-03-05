import { Button } from "@/components/ui/button";
import { AlertCircle, Compass, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { calcQiblaDirection } from "../utils/prayerTimes";

export default function QiblaTab() {
  const location = useLocation();
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!location.loading) {
      const angle = calcQiblaDirection(location.lat, location.lng);
      setQiblaAngle(angle);
    }
  }, [location.lat, location.lng, location.loading]);

  const startCompass = async () => {
    // iOS requires permission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DOE.requestPermission === "function"
    ) {
      try {
        const permission = await (DOE.requestPermission() as Promise<string>);
        if (permission !== "granted") {
          setPermissionError(
            "Permission denied. You can still see your Qibla direction below.",
          );
          return;
        }
      } catch {
        setPermissionError("Unable to request permission.");
        return;
      }
    }

    setPermissionGranted(true);

    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true,
    );
    window.addEventListener("deviceorientation", handleOrientation, true);
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    let compassHeading: number | null = null;

    // Try different ways to get compass heading
    const event = e as DeviceOrientationEvent & {
      webkitCompassHeading?: number;
      absolute?: boolean;
    };
    if (typeof event.webkitCompassHeading === "number") {
      compassHeading = event.webkitCompassHeading;
    } else if (
      e.alpha !== null &&
      (e as DeviceOrientationEvent & { absolute?: boolean }).absolute
    ) {
      compassHeading = 360 - e.alpha;
    } else if (e.alpha !== null) {
      compassHeading = 360 - e.alpha;
    }

    if (compassHeading !== null) {
      setHeading(compassHeading);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup-only effect, intentionally no deps
  useEffect(() => {
    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // Draw compass on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;

    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = "oklch(0.16 0.06 155)";
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "oklch(0.72 0.16 85 / 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cardinal directions
    const cardinals = ["N", "E", "S", "W"];
    const cardinalAngles = [0, 90, 180, 270];
    ctx.font = "bold 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const rotation = heading !== null ? -heading : 0;

    for (let i = 0; i < cardinals.length; i++) {
      const angle = ((cardinalAngles[i] + rotation) * Math.PI) / 180;
      const x = center + (radius - 28) * Math.sin(angle);
      const y = center - (radius - 28) * Math.cos(angle);
      ctx.fillStyle =
        cardinalAngles[i] === 0
          ? "oklch(0.72 0.16 85)"
          : "oklch(0.60 0.05 140)";
      ctx.fillText(cardinals[i], x, y);
    }

    // Tick marks
    for (let deg = 0; deg < 360; deg += 10) {
      const angle = ((deg + rotation) * Math.PI) / 180;
      const tickLen = deg % 30 === 0 ? 12 : 6;
      const x1 = center + (radius - 5) * Math.sin(angle);
      const y1 = center - (radius - 5) * Math.cos(angle);
      const x2 = center + (radius - 5 - tickLen) * Math.sin(angle);
      const y2 = center - (radius - 5 - tickLen) * Math.cos(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "oklch(0.40 0.05 150)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Qibla arrow (green, pointing to Mecca)
    const qiblaRad = ((qiblaAngle + rotation) * Math.PI) / 180;
    const arrowLen = radius - 45;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(qiblaRad);

    // Arrow body
    ctx.beginPath();
    ctx.moveTo(0, -arrowLen);
    ctx.lineTo(8, -arrowLen + 24);
    ctx.lineTo(0, -arrowLen + 18);
    ctx.lineTo(-8, -arrowLen + 24);
    ctx.closePath();
    ctx.fillStyle = "oklch(0.55 0.16 155)";
    ctx.fill();
    ctx.strokeStyle = "oklch(0.72 0.16 85)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stem
    ctx.beginPath();
    ctx.moveTo(0, -arrowLen + 20);
    ctx.lineTo(0, arrowLen * 0.3);
    ctx.strokeStyle = "oklch(0.55 0.16 155 / 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tail dot
    ctx.beginPath();
    ctx.arc(0, arrowLen * 0.3, 4, 0, Math.PI * 2);
    ctx.fillStyle = "oklch(0.55 0.16 155 / 0.4)";
    ctx.fill();

    ctx.restore();

    // Kaaba icon in center
    ctx.fillStyle = "oklch(0.72 0.16 85)";
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🕋", center, center);
  }, [heading, qiblaAngle]);

  const needToPointAngle =
    heading !== null ? (qiblaAngle - heading + 360) % 360 : qiblaAngle;
  const directionText =
    needToPointAngle < 22.5 || needToPointAngle >= 337.5
      ? "Facing Qibla"
      : needToPointAngle < 67.5
        ? "Turn slightly right"
        : needToPointAngle < 112.5
          ? "Turn right"
          : needToPointAngle < 157.5
            ? "Turn sharply right"
            : needToPointAngle < 202.5
              ? "Turn around"
              : needToPointAngle < 247.5
                ? "Turn sharply left"
                : needToPointAngle < 292.5
                  ? "Turn left"
                  : "Turn slightly left";

  return (
    <section
      data-ocid="qibla.section"
      className="flex flex-col items-center gap-5 p-4 pb-24"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Qibla Direction
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {location.loading ? "Locating..." : `From ${location.city}`}
        </p>
      </motion.div>

      {/* Compass Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative"
        data-ocid="qibla.compass.canvas_target"
      >
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-full"
          style={{ filter: "drop-shadow(0 0 20px oklch(0.42 0.14 155 / 0.4))" }}
        />
        {heading === null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-3 backdrop-blur-sm">
              <Compass className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "oklch(0.18 0.06 155)" }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Qibla
          </p>
          <p className="font-display text-2xl font-bold text-islamic-gold">
            {qiblaAngle.toFixed(1)}°
          </p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: "oklch(0.18 0.06 155)" }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Compass
          </p>
          <p className="font-display text-2xl font-bold text-primary">
            {heading !== null ? `${Math.round(heading)}°` : "--"}
          </p>
        </div>
      </div>

      {/* Direction hint */}
      {heading !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: "oklch(0.22 0.08 155)" }}
        >
          <Navigation className="w-4 h-4 text-islamic-gold" />
          <span className="text-sm font-medium text-foreground">
            {directionText}
          </span>
        </motion.div>
      )}

      {/* Permission button */}
      {!permissionGranted && (
        <div className="text-center space-y-3">
          <Button
            data-ocid="qibla.permission.button"
            onClick={startCompass}
            className="gap-2 bg-islamic-green text-white hover:bg-islamic-green-light"
            style={{
              background: "oklch(0.42 0.14 155)",
              color: "white",
            }}
          >
            <Compass className="w-4 h-4" />
            Enable Live Compass
          </Button>
          <p className="text-xs text-muted-foreground px-4">
            Allow device orientation for a live compass pointing to Mecca
          </p>
        </div>
      )}

      {permissionError && (
        <div
          data-ocid="qibla.error_state"
          className="flex items-start gap-2 px-3 py-2.5 rounded-lg w-full max-w-xs"
          style={{ background: "oklch(0.20 0.06 30 / 0.5)" }}
        >
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{permissionError}</p>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground max-w-xs px-4">
        The green arrow points toward the Kaaba in Mecca. Rotate your device
        until the arrow points straight up.
      </p>
    </section>
  );
}
