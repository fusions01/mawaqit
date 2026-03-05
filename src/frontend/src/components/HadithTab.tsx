import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HADITHS, getDailyHadith } from "../data/hadiths";

export default function HadithTab() {
  const { index: dailyIndex } = getDailyHadith();
  const [currentIndex, setCurrentIndex] = useState(dailyIndex);
  const [direction, setDirection] = useState(1);

  const hadith = HADITHS[currentIndex];

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % HADITHS.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + HADITHS.length) % HADITHS.length);
  };

  return (
    <section
      data-ocid="hadith.section"
      className="flex flex-col gap-5 p-4 pb-24"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Daily Hadith
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {currentIndex === dailyIndex
            ? "Today's Hadith"
            : `Hadith ${currentIndex + 1} of ${HADITHS.length}`}
        </p>
      </motion.div>

      {/* Hadith Card */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
            data-ocid="hadith.card"
            className="rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.20 0.07 155), oklch(0.16 0.05 145))",
              border: "1px solid oklch(0.28 0.07 150)",
            }}
          >
            {/* Decorative header */}
            <div
              className="px-5 py-4"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.42 0.14 155 / 0.3), oklch(0.72 0.16 85 / 0.1))",
                borderBottom: "1px solid oklch(0.28 0.07 150)",
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-islamic-gold" />
                <span className="text-islamic-gold text-sm font-semibold">
                  {hadith.source}
                </span>
              </div>
              {hadith.narrator && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Narrated by {hadith.narrator}
                </p>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-islamic-gold/30" />

              {/* English text */}
              <p className="text-foreground leading-relaxed text-base">
                {hadith.text}
              </p>

              {/* Arabic text */}
              {hadith.arabic && (
                <div
                  className="pt-4 mt-4 text-right"
                  style={{ borderTop: "1px solid oklch(0.28 0.07 150)" }}
                >
                  <p className="arabic-text text-xl text-islamic-gold leading-loose">
                    {hadith.arabic}
                  </p>
                </div>
              )}
            </div>

            {/* Hadith number indicator */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 12 }, (_, i) => {
                  const mappedIdx = Math.floor(
                    (currentIndex / HADITHS.length) * 12,
                  );
                  return (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: position-based indicator dots
                      key={i}
                      className="h-1 rounded-full flex-1 transition-all duration-300"
                      style={{
                        background:
                          i === mappedIdx
                            ? "oklch(0.72 0.16 85)"
                            : "oklch(0.25 0.05 150)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          data-ocid="hadith.prev.button"
          variant="outline"
          onClick={goPrev}
          className="flex-1 gap-2 border-border/60"
          style={{ background: "oklch(0.18 0.06 155)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-center text-xs text-muted-foreground whitespace-nowrap">
          {currentIndex + 1} / {HADITHS.length}
        </div>

        <Button
          data-ocid="hadith.next.button"
          variant="outline"
          onClick={goNext}
          className="flex-1 gap-2 border-border/60"
          style={{ background: "oklch(0.18 0.06 155)" }}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Daily indicator */}
      {currentIndex !== dailyIndex && (
        <button
          type="button"
          onClick={() => setCurrentIndex(dailyIndex)}
          className="text-center text-xs text-primary underline-offset-2 hover:underline"
        >
          Go to today's hadith
        </button>
      )}
    </section>
  );
}
