import { useRef, useMemo, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Paperclip, X, FileText, Check } from "lucide-react";
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
  isUploading?: boolean;
  isUploaded?: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  attachment,
  onAttach,
  isUploading = false,
  isUploaded = false,
}: MessageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!attachment) return null;
    if (attachment.type.startsWith("image/")) return URL.createObjectURL(attachment);
    return null;
  }, [attachment]);

  const fileSizeKB = attachment ? Math.round(attachment.size / 1024) : 0;
  const fileSizeLabel = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachment) && !isUploading) onSubmit();
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
        <div className="mb-2 flex items-start gap-2">
          <div className="relative inline-flex overflow-hidden rounded-lg border border-bot-border bg-bot-surface2">
            {attachment.type.startsWith("image/") && preview ? (
              <img src={preview} alt={attachment.name} className="h-16 w-16 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center">
                <FileText className="h-6 w-6 text-bot-text-muted" />
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <svg className="h-8 w-8 animate-spin" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#00d48a" strokeWidth="3" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
                </svg>
              </div>
            )}

            {isUploaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bot-accent">
                  <Check className="h-4 w-4 text-black" />
                </div>
              </div>
            )}

            {!isUploading && (
              <button
                onClick={() => onAttach(null)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-bot-border bg-bot-bg text-bot-text-muted transition-colors hover:border-bot-danger hover:text-bot-danger"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-0.5 pt-1">
            <span className="max-w-[200px] truncate font-mono text-xs text-bot-text-dim">
              {attachment.name}
            </span>
            <span className="font-mono text-[10px] text-bot-text-muted">
              {isUploading ? "Uploading..." : isUploaded ? `Ready \u00b7 ${fileSizeLabel}` : fileSizeLabel}
            </span>
          </div>
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
          disabled={isUploading || !!attachment}
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
          disabled={isLoading || isUploading || (!value.trim() && !attachment)}
          className="h-9 w-9 shrink-0 bg-bot-accent p-0 text-bg-base hover:bg-bot-accent/90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
