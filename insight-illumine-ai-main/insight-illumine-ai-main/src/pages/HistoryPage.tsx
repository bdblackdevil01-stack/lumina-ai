import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, HelpCircle, Layers, Network, History } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { SummaryOutput } from "@/components/outputs/SummaryOutput";
import { QuizOutput } from "@/components/outputs/QuizOutput";
import { FlashcardsOutput } from "@/components/outputs/FlashcardsOutput";
import { MindMapOutput } from "@/components/outputs/MindMapOutput";

interface HistoryItem {
  id: string;
  input_text: string;
  output_type: string;
  output_content: any;
  created_at: string;
}

const typeIcons: Record<string, any> = {
  summary: FileText,
  quiz: HelpCircle,
  flashcards: Layers,
  mindmap: Network,
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load history");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("history").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    }
  };

  const renderOutput = (item: HistoryItem) => {
    switch (item.output_type) {
      case "summary": return <SummaryOutput content={item.output_content} />;
      case "quiz": return <QuizOutput questions={item.output_content} />;
      case "flashcards": return <FlashcardsOutput cards={item.output_content} />;
      case "mindmap": return <MindMapOutput data={item.output_content} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          History
        </h1>
        <p className="text-muted-foreground text-sm">Your previous study conversions</p>
      </motion.div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : items.length === 0 ? (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No history yet. Generate some study materials!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const Icon = typeIcons[item.output_type] || FileText;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card hover:glow-border transition-all">
                  <CardHeader
                    className="flex flex-row items-center justify-between cursor-pointer py-3"
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">{item.output_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "MMM d, yyyy h:mm a")} · {item.input_text.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </CardHeader>
                  {expanded === item.id && (
                    <CardContent className="pt-0">
                      {renderOutput(item)}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
