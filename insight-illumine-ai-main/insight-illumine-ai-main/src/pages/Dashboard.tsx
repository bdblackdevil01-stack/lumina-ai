import { useState } from "react";
import { NotesInput } from "@/components/NotesInput";
import { ActionButtons, OutputType } from "@/components/ActionButtons";
import { SummaryOutput } from "@/components/outputs/SummaryOutput";
import { QuizOutput, QuizQuestion } from "@/components/outputs/QuizOutput";
import { FlashcardsOutput, Flashcard } from "@/components/outputs/FlashcardsOutput";
import { MindMapOutput, MindMapNode } from "@/components/outputs/MindMapOutput";
import { LoadingDots } from "@/components/LoadingDots";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputType, setOutputType] = useState<OutputType | null>(null);
  const [output, setOutput] = useState<any>(null);
  const { user } = useAuth();

  const handleGenerate = async (type: OutputType) => {
    if (!notes.trim()) {
      toast.error("Please enter some notes first");
      return;
    }

    setLoading(true);
    setOutputType(type);
    setOutput(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-study-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ notes, type, userId: user?.id }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate content");
      }

      setOutput(data.result);

      // Save to history
      try {
        await supabase.from("history").insert({
          user_id: user?.id,
          input_text: notes.substring(0, 500),
          output_type: type,
          output_content: data.result,
        });
      } catch (e) {
        console.error("Failed to save history:", e);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate content. Check your API key in Settings.");
      setOutputType(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Paste your notes and let AI transform them into study materials
        </p>
      </motion.div>

      <NotesInput notes={notes} onNotesChange={setNotes} />

      <ActionButtons
        onGenerate={handleGenerate}
        loading={loading}
        disabled={!notes.trim()}
      />

      {loading && <LoadingDots />}

      {!loading && output && outputType === "summary" && (
        <SummaryOutput content={output} />
      )}
      {!loading && output && outputType === "quiz" && (
        <QuizOutput questions={output as QuizQuestion[]} />
      )}
      {!loading && output && outputType === "flashcards" && (
        <FlashcardsOutput cards={output as Flashcard[]} />
      )}
      {!loading && output && outputType === "mindmap" && (
        <MindMapOutput data={output as MindMapNode} />
      )}
    </div>
  );
}
