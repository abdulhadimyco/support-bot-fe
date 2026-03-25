import { useRef, useEffect, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { WelcomeScreen } from "@/components/layout/WelcomeScreen";
import { ToolResultRenderer } from "@/components/chat/ToolResultRenderer";
import { useAuth } from "@/lib/auth";
import type { ToolInvocation } from "@/components/chat/MessageBubble";

interface ChatInterfaceProps {
  threadId: string | null;
  onThreadCreated?: (id: string) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

// TODO: Replace with real API when backend is ready
const MOCK_THREAD_MESSAGES: Record<string, ChatMessage[]> = {
  t1: [
    { id: "t1-1", role: "user", content: "Customer john@example.com says his JazzCash payment went through but isn't reflecting in the system." },
    { id: "t1-2", role: "assistant", content: "I found the customer profile. Let me pull up their details...\n\nThe customer **john@example.com** has an active Premium subscription, signed up 4 months ago. Let me check the payment history." },
    { id: "t1-3", role: "user", content: "Check payment history for john@example.com" },
    { id: "t1-4", role: "assistant", content: "Here's the payment timeline for this customer:\n\n- **PKR 1,200** — Mar 15, 2026 — Completed (JazzCash)\n- **PKR 1,200** — Feb 15, 2026 — Completed (JazzCash)\n- **PKR 1,200** — Jan 15, 2026 — Completed (EasyPaisa)\n\nAll 3 payments were successful. Total: PKR 3,600. The latest JazzCash payment on Mar 15 shows as **Completed** on our end. It may be a display delay on the customer's app. Would you like me to trigger a sync or escalate?" },
  ],
  t2: [
    { id: "t2-1", role: "user", content: "Sara Ahmed (sara@example.com) renewed her subscription but can't access premium content." },
    { id: "t2-2", role: "assistant", content: "Let me look up Sara Ahmed's account...\n\n**Sara Ahmed** — sara@example.com\n- Subscription: Premium (renewed 2 days ago)\n- Status: **Active**\n- Payment: PKR 1,200 via EasyPaisa — Completed\n\nThe subscription is active and payment went through. This might be a cache issue. Would you like me to check her active sessions or force a content refresh?" },
  ],
  t3: [
    { id: "t3-1", role: "user", content: "Ali Khan is reporting live stream buffering on the mobile app." },
    { id: "t3-2", role: "assistant", content: "Let me check Ali Khan's watch activity and device info...\n\n**Ali Khan** — ali@example.com\n- Device: iPhone 13, iOS 17.2\n- App version: 3.4.1\n- Network: 4G (average 8 Mbps)\n\nLast 3 live streams all show buffering events. This matches a known issue tracked in **MCSB-135**. The fix is scheduled for the next app release (v3.5.0).\n\nWould you like me to add Ali's case to the Jira ticket?" },
    { id: "t3-3", role: "user", content: "Yes, add his case to the ticket and let him know." },
    { id: "t3-4", role: "assistant", content: "Done! I've added Ali Khan's case to **MCSB-135** with his device details and buffering logs.\n\nSuggested response to customer:\n> *Hi Ali, we're aware of the buffering issue on the mobile app and our team is actively working on a fix in the next update (v3.5.0). We've added your case to our tracking. Apologies for the inconvenience!*\n\nThis thread has been marked as **closed** since it's a known issue with a fix in progress." },
  ],
};

// TODO: Replace this mock with real useChat + backend transport when BE is ready.
// For now, assistant echoes back a canned response so the UI is testable.
function mockAssistantReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("look up") || lower.includes("lookup") || lower.includes("email"))
    return "I found the customer profile. Let me pull up their details...\n\nThe customer **john@example.com** has an active Premium subscription, signed up 4 months ago. Would you like me to check their payment history or watch activity?";
  if (lower.includes("payment"))
    return "Here's the payment timeline for this customer:\n\n- **PKR 1,200** — Mar 15, 2026 — Completed (JazzCash)\n- **PKR 1,200** — Feb 15, 2026 — Completed (JazzCash)\n- **PKR 1,200** — Jan 15, 2026 — Completed (EasyPaisa)\n\nAll 3 payments were successful. Total: PKR 3,600. Would you like more detail on any specific payment?";
  if (lower.includes("jira") || lower.includes("ticket"))
    return "Found 3 open Jira tickets:\n\n1. **MCSB-142** — Login issue on iOS app (High)\n2. **MCSB-139** — Payment not reflecting (Medium)\n3. **MCSB-135** — Cannot play live stream (Low)\n\nWould you like me to create a new ticket or update an existing one?";
  if (lower.includes("capabilities") || lower.includes("what can"))
    return "I can help you with:\n\n- **Customer Lookup** — Find users by email or phone\n- **Subscription Check** — View license status, plans, expiry\n- **Payment History** — Full timeline with gateway details\n- **Watch Activity** — Calendar view of viewing history\n- **Jira Management** — Create, update, comment on tickets\n- **Escalation** — Flag critical issues for review\n- **Reports** — Generate shareable dispute reports\n\nJust tell me what you need!";
  if (lower.includes("watch") || lower.includes("calendar"))
    return "Loading the watch calendar for this customer...\n\nThis month they watched **23 videos** over **14 active days**:\n- Live streams: 8 (total 12h 30m)\n- VOD content: 15 (total 6h 45m)\n\nWould you like to see a specific day's detail?";
  return `I understand you're asking about: "${userText}"\n\nLet me look into that for you. In the meantime, you can try:\n- Looking up a customer by email\n- Checking payment history\n- Viewing Jira tickets\n\n[DEV_ALERT]This is a mock response. Backend is not connected yet.[/DEV_ALERT]`;
}

export function ChatInterface({
  threadId,
  onThreadCreated: _onThreadCreated,
}: ChatInterfaceProps) {
  const { agent } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load mock messages when threadId changes
  useEffect(() => {
    if (threadId && MOCK_THREAD_MESSAGES[threadId]) {
      setMessages(MOCK_THREAD_MESSAGES[threadId]);
    } else {
      setMessages([]);
    }
    setInput("");
    setAttachment(null);
    setIsStreaming(false);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const agentInitials =
    agent?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AG";

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      // Simulate streaming delay
      setTimeout(() => {
        const reply: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: mockAssistantReply(text),
        };
        setMessages((prev) => [...prev, reply]);
        setIsStreaming(false);
      }, 800 + Math.random() * 700);
    },
    [],
  );

  const handleSuggestion = useCallback(
    (text: string) => sendMessage(text),
    [sendMessage],
  );

  function onSubmit() {
    if (!input.trim() && !attachment) return;
    sendMessage(input);
    setInput("");
    setAttachment(null);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex min-h-full flex-col">
          {!hasMessages ? (
            <WelcomeScreen onSuggestion={handleSuggestion} />
          ) : (
            <div className="flex-1 py-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  agentInitials={agentInitials}
                  toolInvocations={msg.toolInvocations}
                  renderToolResult={(invocation) => (
                    <ToolResultRenderer
                      toolName={invocation.toolName}
                      result={invocation.result}
                    />
                  )}
                />
              ))}
              {isStreaming && (
                <div className="flex gap-3 px-4 py-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-c3-accent/15 font-mono text-[10px] font-semibold text-c3-accent">
                    C3
                  </div>
                  <TypingIndicator />
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <MessageInput
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        isLoading={isStreaming}
        attachment={attachment}
        onAttach={setAttachment}
      />
    </div>
  );
}
