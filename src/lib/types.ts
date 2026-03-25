export interface Agent {
  id: string;
  email: string;
  name: string;
  role: "agent" | "admin";
}

export interface Thread {
  id: string;
  agentId: string;
  customerEmail: string | null;
  customerName: string | null;
  summary: string | null;
  status: "active" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  metadata?: MessageMetadata | null;
  createdAt: string;
}

export interface MessageMetadata {
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  elapsedMs?: number;
}

export interface Report {
  id: string;
  threadId: string;
  shareToken: string;
  expiresAt: string;
  reportData: ReportData;
  createdAt: string;
}

export interface ReportData {
  title: string;
  customerSummary: string;
  timeline: string;
  evidence: string;
  nextSteps: string;
  technicalSummary: string;
}

// Tool result types rendered in chat
export interface UserProfile {
  user_id: string;
  name: string;
  username?: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  country?: string;
  city?: string;
  gender?: string;
  role?: string;
  signupDate?: string;
  deleted?: boolean;
}

export interface PaymentEvent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  gateway?: string;
  plan?: string;
  source?: string;
  subscriptionStatus?: string;
  licensePlans?: string[];
}

export interface PaymentSection {
  licenseName: string;
  status: string;
  expiryDate?: string;
  renewalDate?: string;
  payments: PaymentEvent[];
  totalsByCurrency: Record<string, number>;
}

export interface WatchDay {
  date: string;
  entries: WatchEntry[];
}

export interface WatchEntry {
  title: string;
  duration: number;
  type: "live" | "vod";
  videoId?: string;
  viewCount?: number;
  clientDevice?: string;
}

export interface WatchCalendarData {
  userId: string;
  userName: string;
  userEmail: string;
  year: number;
  month: number;
  days: Record<string, WatchDay>;
  stats: {
    totalTime: number;
    activeDays: number;
    vodCount: number;
    vodDuration: number;
    liveCount: number;
    liveDuration: number;
  };
}

export interface SubscriptionInfo {
  userId: string;
  licenseName: string;
  status: string;
  plan?: string;
  expiryDate?: string;
  renewalDate?: string;
  autoRenew?: boolean;
}
