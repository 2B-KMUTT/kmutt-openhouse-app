export interface LandingScheduleItem {
  id: number;
  time: string;
  session: "morning" | "break" | "afternoon" | "all" | string;
  category: string;
  categoryColor: string;
  title: string;
  details?: string[] | null;
  subSectionTitle?: string | null;
  subSectionItems?: string[] | null;
  isBreak?: boolean;
  orderIndex: number;
  display: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LandingBoothItem {
  id: number;
  location: string;
  units: string[];
  orderIndex: number;
  display: boolean;
  created_at?: string;
  updated_at?: string;
}
