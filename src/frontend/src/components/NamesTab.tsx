import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { NAMES_OF_ALLAH } from "../data/namesOfAllah";

export default function NamesTab() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return NAMES_OF_ALLAH;
    return NAMES_OF_ALLAH.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.arabic.includes(q),
    );
  }, [search]);

  return (
    <section
      data-ocid="names.section"
      className="flex flex-col gap-4 p-4 pb-24 h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-semibold text-foreground">
          99 Names of Allah
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Asma ul Husna — أسماء الله الحسنى
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="names.search_input"
          placeholder="Search by name or meaning..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border/60 focus:border-primary"
          style={{ background: "oklch(0.18 0.06 155)" }}
        />
      </div>

      {/* Result count */}
      {search && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} of 99 names
        </p>
      )}

      {/* Names list */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div data-ocid="names.list" className="grid gap-2 pb-4">
          {filtered.map((name, idx) => (
            <motion.div
              key={name.number}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.4) }}
              data-ocid={`names.item.${name.number}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-islamic-gold/30 transition-colors"
            >
              {/* Number badge */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{
                  background: "oklch(0.22 0.08 155)",
                  color: "oklch(0.72 0.16 85)",
                }}
              >
                {name.number}
              </div>

              {/* Names */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {name.transliteration}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {name.meaning}
                </p>
              </div>

              {/* Arabic */}
              <div className="text-right flex-shrink-0">
                <p className="font-display text-lg text-islamic-gold arabic-text">
                  {name.arabic}
                </p>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div data-ocid="names.empty_state" className="text-center py-12">
              <p className="text-muted-foreground">
                No names found for "{search}"
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
