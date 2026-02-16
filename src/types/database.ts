export interface Destination {
  id: string;
  phrase: string;
  url: string;
  created_by: string | null;
  created_at: string;
  click_count: number;
  is_active: boolean;
  status: "active" | "pending_review" | "rejected";
  flag_reason: string | null;
  deleted_at: string | null;
}
