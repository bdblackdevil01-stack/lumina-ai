import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsOutputProps {
  cards: Flashcard[];
}

export function FlashcardsOutput({ cards }: FlashcardsOutputProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const next = () => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const copy = () => {
    const text = cards.map((c, i) => `${i + 1}. Q: ${c.question}\n   A: ${c.answer}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const text = cards.map((c, i) => `${i + 1}. Q: ${c.question}\n   A: ${c.answer}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card glow-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Flashcards ({index + 1}/{cards.length})
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={download}><Download className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="perspective-1000 cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className={`relative w-full min-h-[180px] preserve-3d transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden rounded-xl border border-border/50 bg-primary/5 p-6 flex items-center justify-center text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">QUESTION</p>
                  <p className="font-medium">{card?.question}</p>
                  <p className="text-xs text-muted-foreground mt-4">Click to reveal</p>
                </div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border border-primary/30 bg-primary/10 p-6 flex items-center justify-center text-center">
                <div>
                  <p className="text-xs text-primary mb-2">ANSWER</p>
                  <p className="font-medium">{card?.answer}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={prev} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {index + 1} / {cards.length}
            </span>
            <Button variant="outline" size="icon" onClick={next} disabled={index === cards.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
