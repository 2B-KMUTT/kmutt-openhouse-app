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
  heroTitle: "KMUTT OPEN HOUSE",
  heroSubtitle: "เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม",
  heroDateText: "วันเสาร์ที่ 21 พฤศจิกายน 2569 เวลา 09.00 – 15.00 น.",
  heroLocationText: "ณ โรงแรมเซ็น อ.เมืองนครปฐม จ.นครปฐม",
  eventDateTh: "วันเสาร์ที่ 21 พฤศจิกายน 2569 เวลา 09.00 – 15.00 น.",
  eventLocationTh: "ณ โรงแรมเซ็น อ.เมืองนครปฐม จ.นครปฐม",
  eventDateEn: "Saturday, November 21, 2026, from 09:00 a.m. to 3:00 p.m.",
  eventLocationEn: "at Xen Hotel, Mueang Nakhon Pathom, Nakhon Pathom",
  regisDeadlineText: "20 พฤศจิกายน 2569",
  regisLink: "https://kmutt.me/oph_Ratchaburi",
  openChatLink: "https://kmutt.me/OpenChatOPH2025",
  mapUrl: "https://maps.google.com/?q=Xen+Hotel+Nakhon+Pathom",
  coordinatorName: "คุณศราวุฒิ จันทร์แฉล้ม",
  coordinatorPhone: "032-726510",
  coordinatorEmail: "sarawut.jun@kmutt.ac.th",
};

export type KnownLandingConfigKey =
  | "heroTitle"
  | "heroSubtitle"
  | "heroDateText"
  | "heroLocationText"
  | "eventDateTh"
  | "eventLocationTh"
  | "eventDateEn"
  | "eventLocationEn"
  | "regisDeadlineText"
  | "regisLink"
  | "mapUrl"
  | "coordinatorName"
  | "coordinatorPhone"
  | "coordinatorEmail"
  | "openChatLink"
  | "surveyStatus"
  | "surveyStartDate"
  | "surveyEndDate"
  | "surveyConfig";

export interface LandingConfigMap {
  heroTitle?: string;
  heroSubtitle?: string;
  heroDateText?: string;
  heroLocationText?: string;
  eventDateTh?: string;
  eventLocationTh?: string;
  eventDateEn?: string;
  eventLocationEn?: string;
  regisDeadlineText?: string;
  regisLink?: string;
  mapUrl?: string;
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

