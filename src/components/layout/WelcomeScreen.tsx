import { Search, CreditCard, Ticket, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  {
    icon: Search,
    title: "Look up customer",
    description: "Find a customer by email or phone",
    prompt: "Look up customer by email ",
  },
  {
    icon: CreditCard,
    title: "Check payment history",
    description: "View payment timeline and details",
    prompt: "Check payment history for ",
  },
  {
    icon: Ticket,
    title: "List Jira tickets",
    description: "View recent support tickets",
    prompt: "List recent Jira tickets",
  },
  {
    icon: HelpCircle,
    title: "What can Sherlock do?",
    description: "Learn about available tools",
    prompt: "What can you do? List all your capabilities.",
  },
];

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="glow-accent-box mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-bot-accent/15">
        <span className="glow-accent font-mono text-lg font-semibold text-bot-accent">
          SH
        </span>
      </div>
      <h2 className="glow-accent mb-1 text-xl font-semibold text-bot-accent">
        Sherlock
      </h2>
      <p className="mb-8 text-sm text-bot-text-muted">
        How can I help you today?
      </p>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {suggestions.map((s) => (
          <Card
            key={s.title}
            onClick={() => onSuggestion(s.prompt)}
            className="cursor-pointer border-bot-border bg-bot-surface p-4 transition-colors hover:border-bot-accent/30 hover:bg-bot-surface2"
          >
            <s.icon className="mb-2 h-5 w-5 text-bot-accent" />
            <div className="text-sm font-medium text-bot-text">{s.title}</div>
            <div className="mt-0.5 text-xs text-bot-text-muted">
              {s.description}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
