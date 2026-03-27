export interface Agent {
  id: string;
  email: string;
  name: string;
  username: string;
  role: "agent" | "admin";
}

export interface MycoUser {
  given_name: string;
  family_name: string;
  email: string;
  email_verified: string;
  phone_number_verified: string;
  username: string;
  preferred_username: string;
  group: string;
  "cognito:groups": string[];
  userid: string;
  "myco:userid": string;
  birthdate: string;
  country: string;
  city: string;
  gender: string;
  auth_time: number;
  is_gdpr_captured: boolean;
  donot_ask_again_demographic: boolean;
  profile_status: string;
  partner: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: MycoUser;
  isGoogleLogin: boolean;
  isAppleLogin: boolean;
}

export interface Thread {
  id: string;
  userId: string;
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

// ── Tool result types (match backend snake_case response shapes) ──

export interface UserProfile {
  source?: string;
  user_id: string;
  product_user_id?: string | null;
  email: string;
  name: string | null;
  username?: string | null;
  phone?: string | null;
  phone_verified?: boolean;
  email_verified?: boolean;
  country?: string | null;
  city?: string | null;
  gender?: string | null;
  group?: string | null;
  deleted_on?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Payment {
  receipt_id?: string | null;
  created_at?: string | null;
  amount: number;
  currency: string | null;
  payment_gateway?: string | null;
  status: string;
  license_name?: string | null;
  license_id?: string | null;
  plan_name?: string | null;
  product_identifier?: string | null;
  checkout_duration?: number | null;
  is_onetime?: boolean;
  is_completed?: boolean;
  is_canceled?: boolean;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  next_renewal?: string | null;
  recurrence_interval?: string | null;
  license_plans?: Array<{
    name?: string;
    price?: number;
    currency?: string;
    duration?: number;
  }>;
  source_db?: string | null;
  pg_transaction_id?: string | null;
}

export interface LicenseTimeline {
  license_id?: string | null;
  license_name?: string | null;
  license_label?: string | null;
  payment_count: number;
  totals_by_currency: Record<string, number>;
  latest_subscription_status?: string | null;
  latest_subscription_expires_at?: string | null;
  next_renewal_from_sub?: string | null;
  payments: Payment[];
}

export interface PaymentHistoryResponse {
  source?: string;
  user_id: string;
  email?: string | null;
  name?: string | null;
  payment_count: number;
  totals_by_currency: Record<string, number>;
  receipts_found?: number;
  checkouts_found?: number;
  subscriptions_found?: number;
  postgres_transactions_count?: number;
  license_timelines: LicenseTimeline[];
  payments: Payment[];
  summary?: {
    latest_payment_at?: string | null;
    latest_payment_status?: string | null;
    latest_subscription_status?: string | null;
    active_subscription_expires_at?: string | null;
  };
}

export interface WatchCalendarDay {
  day: number;
  live_count: number;
  vod_count: number;
  total_seconds: number;
  total_entries: number;
  top_videos: WatchEntry[];
}

export interface WatchEntry {
  video_title: string;
  type: "live" | "vod";
  view_seconds: number;
  view_count?: number;
  client?: string;
}

export interface WatchMonthSummary {
  year: number;
  month: number;
  active_days: number;
  live_count: number;
  vod_count: number;
  live_seconds: number;
  vod_seconds: number;
  total_seconds: number;
  days: WatchCalendarDay[];
}

export interface WatchCalendarData {
  user_id: string;
  current_year: number;
  current_month: number;
  months: WatchMonthSummary[];
}

export interface WatchCalendarDayDetail {
  user_id: string;
  year: number;
  month: number;
  day: number;
  total_seconds: number;
  videos: WatchEntry[];
}

export interface SubscriptionResponse {
  source?: string;
  user_id: string;
  subscription_count: number;
  active_count: number;
  inactive_count: number;
  subscriptions: SubscriptionItem[];
}

export interface SubscriptionItem {
  status: string;
  is_canceled?: boolean;
  is_onetime?: boolean;
  license_name?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  plan_name?: string | null;
  price?: number | null;
  currency?: string | null;
  is_completed?: boolean | null;
}
