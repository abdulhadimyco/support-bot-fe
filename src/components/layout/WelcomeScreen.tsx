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
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
        <span className="font-mono text-lg font-semibold text-accent">
          SH
        </span>
      </div>
      <h2 className="mb-1 text-xl font-semibold text-text-primary">
        Sherlock
      </h2>
      <p className="mb-8 text-sm text-text-muted">
        How can I help you today?
      </p>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {suggestions.map((s) => (
          <Card
            key={s.title}
            onClick={() => onSuggestion(s.prompt)}
            className="cursor-pointer border-border-subtle bg-surface p-4 transition-colors hover:border-accent/30 hover:bg-surface2"
          >
            <s.icon className="mb-2 h-5 w-5 text-accent" />
            <div className="text-sm font-medium text-text-primary">{s.title}</div>
            <div className="mt-0.5 text-xs text-text-muted">
              {s.description}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
