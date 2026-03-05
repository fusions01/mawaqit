import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useIncrementTasbih,
  useResetTasbih,
  useTasbihCount,
} from "../hooks/useQueries";

const PRESETS = [
  { name: "SubhanAllah", arabic: "سبحان الله", target: 33 },
  { name: "Alhamdulillah", arabic: "الحمد لله", target: 33 },
  { name: "Allahu Akbar", arabic: "الله أكبر", target: 33 },
  { name: "La ilaha illallah", arabic: "لا إله إلا الله", target: 100 },
];

export default function TasbihTab() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const { data: count = BigInt(0), isLoading } = useTasbihCount();
  const increment = useIncrementTasbih();
  const reset = useResetTasbih();
  const [ripple, setRipple] = useState(false);

  const preset = PRESETS[selectedPreset];
  const target = preset.target;
  const countNum = Number(count);
  const progress = Math.min(
    (countNum % target ||
      (countNum > 0 && countNum % target === 0 ? target : 0)) / target,
    1,
  );
  const cycles = Math.floor(countNum / target);

  const handleTap = async () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 300);

    try {
      await increment.mutateAsync();
      if ((Number(count) + 1) % target === 0) {
        toast.success(
          `${preset.name} — ${Math.floor((Number(count) + 1) / target)} cycles complete!`,
          {
            duration: 2000,
          },
        );
      }
    } catch {
      toast.error("Failed to save count");
    }
  };

  const handleReset = async () => {
    try {
      await reset.mutateAsync();
      toast.success("Counter reset");
    } catch {
      toast.error("Failed to reset");
    }
  };

  const handlePresetChange = (idx: number) => {
    setSelectedPreset(idx);
  };

  // SVG circle progress
  const circumference = 2 * Math.PI * 110;
  const dashOffset = circumference * (1 - progress);

  return (
    <section
      data-ocid="tasbih.section"
      className="flex flex-col items-center gap-5 p-4 pb-24"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Tasbih Counter
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Digital Dhikr</p>
      </motion.div>

      {/* Preset selector */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {PRESETS.map((p, idx) => (
          <button
            type="button"
            key={p.name}
            data-ocid={`tasbih.preset.item.${idx + 1}`}
            onClick={() => handlePresetChange(idx)}
            className={`px-3 py-2.5 rounded-xl text-left transition-all duration-200 border ${
              selectedPreset === idx
                ? "border-islamic-gold bg-islamic-gold/10"
                : "border-border/50 bg-card hover:border-border"
            }`}
          >
            <p
              className={`text-xs font-medium truncate ${selectedPreset === idx ? "text-islamic-gold" : "text-foreground/70"}`}
            >
              {p.name}
            </p>
            <p
              className={`text-sm font-display arabic-text ${selectedPreset === idx ? "text-foreground" : "text-muted-foreground"}`}
            >
              {p.arabic}
            </p>
          </button>
        ))}
      </div>

      {/* Counter display with ring */}
      <div className="relative flex items-center justify-center">
        <svg
          className="tasbih-ring"
          width={260}
          height={260}
          viewBox="0 0 260 260"
          aria-label="Tasbih progress ring"
          role="img"
        >
          {/* Background track */}
          <circle
            cx="130"
            cy="130"
            r="110"
            fill="none"
            stroke="oklch(0.22 0.06 155)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <motion.circle
            cx="130"
            cy="130"
            r="110"
            fill="none"
            stroke="oklch(0.72 0.16 85)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 130 130)"
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.3 }}
          />
        </svg>

        {/* Tap button */}
        <motion.button
          data-ocid="tasbih.counter.button"
          onClick={handleTap}
          disabled={increment.isPending || isLoading}
          className="absolute w-48 h-48 rounded-full flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.08 155), oklch(0.18 0.06 145))",
            border: "2px solid oklch(0.42 0.14 155 / 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={countNum}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-display font-bold tabular-nums"
              style={{
                fontSize: "64px",
                color: "oklch(0.72 0.16 85)",
                lineHeight: 1,
              }}
            >
              {countNum}
            </motion.span>
          </AnimatePresence>
          <p className="text-xs text-muted-foreground mt-1">Tap to count</p>
          {ripple && (
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute w-full h-full rounded-full border-2 border-islamic-gold"
            />
          )}
        </motion.button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 w-full justify-center">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Cycles</p>
          <p className="font-display text-xl font-bold text-primary">
            {cycles}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="font-display text-xl font-bold text-islamic-gold">
            {target}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="font-display text-xl font-bold text-foreground">
            {target - (countNum % target || (countNum > 0 ? 0 : target))}
          </p>
        </div>
      </div>

      {/* Dhikr display */}
      <motion.div
        key={selectedPreset}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-3 px-6 rounded-xl w-full"
        style={{ background: "oklch(0.16 0.06 155)" }}
      >
        <p className="arabic-text text-2xl text-islamic-gold mb-1">
          {preset.arabic}
        </p>
        <p className="text-sm text-muted-foreground">{preset.name}</p>
      </motion.div>

      {/* Cycles milestone */}
      {cycles > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "oklch(0.22 0.08 155)" }}
        >
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground">
            {cycles} {cycles === 1 ? "cycle" : "cycles"} completed
          </span>
        </motion.div>
      )}

      {/* Reset */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            data-ocid="tasbih.reset.button"
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/30 text-muted-foreground hover:border-destructive hover:text-destructive"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Counter
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          data-ocid="tasbih.dialog"
          className="border-border"
          style={{ background: "oklch(var(--card))" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Counter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your tasbih count to zero. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="tasbih.cancel.button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="tasbih.confirm.button"
              onClick={handleReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
