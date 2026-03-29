import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, HelpCircle, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index
  explanation?: string;
}

interface QuizOutputProps {
  questions: QuizQuestion[];
}

export function QuizOutput({ questions }: QuizOutputProps) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const score = Object.entries(revealed).filter(
    ([qi]) => selected[Number(qi)] === questions[Number(qi)].answer
  ).length;

  const copy = () => {
    const text = questions
      .map((q, i) => `${i + 1}. ${q.question}\n${q.options.map((o, j) => `  ${String.fromCharCode(65 + j)}) ${o}`).join("\n")}\nAnswer: ${String.fromCharCode(65 + q.answer)}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const text = questions
      .map((q, i) => `${i + 1}. ${q.question}\n${q.options.map((o, j) => `  ${String.fromCharCode(65 + j)}) ${o}`).join("\n")}\nAnswer: ${String.fromCharCode(65 + q.answer)}${q.explanation ? `\nExplanation: ${q.explanation}` : ""}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card glow-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Quiz ({Object.keys(revealed).length}/{questions.length} answered — Score: {score})
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={download}><Download className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="p-4 rounded-lg bg-background/50 border border-border/30 space-y-2">
              <p className="font-medium text-sm">{qi + 1}. {q.question}</p>
              <div className="grid gap-1.5">
                {q.options.map((opt, oi) => {
                  const isRevealed = revealed[qi];
                  const isSelected = selected[qi] === oi;
                  const isCorrect = q.answer === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => {
                        if (isRevealed) return;
                        setSelected((s) => ({ ...s, [qi]: oi }));
                        setRevealed((r) => ({ ...r, [qi]: true }));
                      }}
                      className={cn(
                        "text-left text-sm px-3 py-2 rounded-md border transition-all",
                        !isRevealed && "border-border/30 hover:border-primary/40 hover:bg-accent/30",
                        isRevealed && isCorrect && "border-green-500/50 bg-green-500/10",
                        isRevealed && isSelected && !isCorrect && "border-destructive/50 bg-destructive/10",
                        isRevealed && !isSelected && !isCorrect && "opacity-50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + oi)})</span>
                        {opt}
                        {isRevealed && isCorrect && <Check className="h-3 w-3 text-green-500 ml-auto" />}
                        {isRevealed && isSelected && !isCorrect && <X className="h-3 w-3 text-destructive ml-auto" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {revealed[qi] && q.explanation && (
                <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
