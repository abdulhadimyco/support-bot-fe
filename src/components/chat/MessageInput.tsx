import { useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  attachment: File | null;
  onAttach: (file: File | null) => void;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  attachment,
  onAttach,
}: MessageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || attachment) onSubmit();
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    onAttach(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="border-t border-bot-border bg-bot-surface p-3">
      {attachment && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-bot-surface2 px-2 py-1 text-xs text-bot-text-dim">
          <Paperclip className="h-3 w-3" />
          <span className="max-w-[200px] truncate">{attachment.name}</span>
          <button
            onClick={() => onAttach(null)}
            className="ml-1 text-bot-text-muted hover:text-bot-danger"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-bot-text-muted hover:text-bot-text"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[36px] max-h-[120px] resize-none border-bot-border bg-bot-bg font-sans text-sm text-bot-text placeholder:text-bot-text-muted focus-visible:ring-bot-accent/50"
          rows={1}
        />

        <Button
          onClick={onSubmit}
          disabled={isLoading || (!value.trim() && !attachment)}
          className="h-9 w-9 shrink-0 bg-bot-accent p-0 text-bg-base hover:bg-bot-accent/90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
