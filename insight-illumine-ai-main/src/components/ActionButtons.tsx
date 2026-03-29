import { FileText, HelpCircle, Layers, Network } from "lucide-react";
import { motion } from "framer-motion";

export type OutputType = "summary" | "quiz" | "flashcards" | "mindmap";

interface ActionButtonsProps {
  onGenerate: (type: OutputType) => void;
  loading: boolean;
  disabled: boolean;
}

const actions = [
  { type: "summary" as OutputType, label: "Summary", icon: FileText, desc: "Key points condensed", color: "from-violet-500 to-indigo-500", bg: "bg-violet-500/10", text: "text-violet-500" },
  { type: "quiz" as OutputType, label: "Quiz", icon: HelpCircle, desc: "MCQ with answers", color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-500" },
  { type: "flashcards" as OutputType, label: "Flashcards", icon: Layers, desc: "Q/A flip cards", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10", text: "text-emerald-500" },
  { type: "mindmap" as OutputType, label: "Mind Map", icon: Network, desc: "Visual structure", color: "from-fuchsia-500 to-pink-500", bg: "bg-fuchsia-500/10", text: "text-fuchsia-500" },
];

export function ActionButtons({ onGenerate, loading, disabled }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onGenerate(action.type)}
          disabled={loading || disabled}
          className="group relative p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col gap-2">
            <div className={`h-10 w-10 rounded-lg ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className={`h-5 w-5 ${action.text}`} />
            </div>
            <div>
              <div className="font-semibold text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.desc}</div>
            </div>
          </div>
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
        </motion.button>
      ))}
    </div>
  );
}
