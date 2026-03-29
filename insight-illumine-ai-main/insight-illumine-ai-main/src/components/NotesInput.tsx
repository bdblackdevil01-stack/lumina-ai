import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface NotesInputProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function NotesInput({ notes, onNotesChange }: NotesInputProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .txt, .pdf, or .docx file");
      return;
    }

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text();
      onNotesChange(text);
      setFileName(file.name);
    } else {
      toast.info("PDF/DOCX parsing — paste your notes as text for now");
    }
  };

  const clearFile = () => {
    setFileName(null);
    onNotesChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          placeholder="Paste your study notes here..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[200px] resize-y bg-background/50 border-border/50 focus:border-primary/50 text-base"
        />
        <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
          {wordCount} words · {charCount} chars
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.pdf,.docx"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        {fileName && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
            <FileText className="h-3 w-3" />
            {fileName}
            <button onClick={clearFile} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
