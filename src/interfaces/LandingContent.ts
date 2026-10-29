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

export interface LandingBannerItem {
  id: number;
  imageUrl: string;
  altText?: string | null;
  linkUrl?: string | null;
  orderIndex: number;
  display: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_LANDING_CONFIG = {
  heroTitle: "KMUTT Open House",
  heroSubtitle: "เปิดเฮือน มจธ. (มดอีสาน) ครั้งที่ 1",
  heroDateText: "วันศุกร์ที่ 30 ตุลาคม 2569 เวลา 09.00 – 16.00 น.",
  heroLocationText: "ณ โรงแรมเพชรรัชต์การ์เด้น อ.เมือง จ.ร้อยเอ็ด",
  regisDeadlineText: "26 ตุลาคม 2569",
  regisLink: "https://kmutt.me/oph_RoiEt",
  openChatLink: "https://kmutt.me/OpenChatOPH2025",
  mapUrl: "https://maps.google.com/?q=Petcharat+Garden+Hotel+Roi+Et",
  coordinatorName: "นางสาวสุวะรักษ์ ศิริวรรณ์",
  coordinatorPhone: "0 2470 8471",
  coordinatorEmail: "admission@kmutt.ac.th",
};

export interface LandingConfigMap {
  heroTitle?: string;
  heroSubtitle?: string;
  eventDateTh?: string;
  eventLocationTh?: string;
  eventDateEn?: string;
  eventLocationEn?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  openChatLink?: string;
  surveyStatus?: "auto" | "open" | "closed";
  surveyStartDate?: string;
  surveyEndDate?: string;
  [key: string]: any;
}

export interface ThreeJomQuestionConfig {
  enabled: boolean;
  title: string;
  options: string[];
}

export interface SurveyConfig {
  provinces: string[];
  sourceChannels: string[];
  studentGrades: string[];
  studentStreams: string[];
  studentFaculties: string[];
  studentFactors: string[];
  studentWorries: string[];
  parentGrades: string[];
  parentWorries: string[];
  parentInfoNeeded: string[];
  parentChannels: string[];
  teacherNeeds: string[];
  threeJomQuestion: ThreeJomQuestionConfig;
}

