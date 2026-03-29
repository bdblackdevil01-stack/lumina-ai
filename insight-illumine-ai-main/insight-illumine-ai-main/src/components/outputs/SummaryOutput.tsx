import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SummaryOutputProps {
  content: string;
}

export function SummaryOutput({ content }: SummaryOutputProps) {
  const copy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card glow-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Summary
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={download}><Download className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {content}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
