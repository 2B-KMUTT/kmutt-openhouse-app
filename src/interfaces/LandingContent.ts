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

import landingConfigsSeed from "../../prisma/data/landing-configs.json";

const seedConfigMap: Record<string, string> = {};
for (const item of landingConfigsSeed) {
  seedConfigMap[item.key] = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
}

export const DEFAULT_LANDING_CONFIG = {
  heroTitle: seedConfigMap.heroTitle || "KMUTT OPEN HOUSE",
  heroSubtitle: seedConfigMap.heroSubtitle || "เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม",
  heroDateText: seedConfigMap.heroDateText || seedConfigMap.eventDateTh || "วันเสาร์ที่ 21 พฤศจิกายน 2569 เวลา 09.00 – 15.00 น.",
  heroLocationText: seedConfigMap.heroLocationText || seedConfigMap.eventLocationTh || "ณ โรงแรมเซ็น อ.เมืองนครปฐม จ.นครปฐม",
  eventDateTh: seedConfigMap.eventDateTh || "วันเสาร์ที่ 21 พฤศจิกายน 2569 เวลา 09.00 – 15.00 น.",
  eventLocationTh: seedConfigMap.eventLocationTh || "ณ โรงแรมเซ็น อ.เมืองนครปฐม จ.นครปฐม",
  eventDateEn: seedConfigMap.eventDateEn || "Saturday, November 21, 2026, from 09:00 a.m. to 3:00 p.m.",
  eventLocationEn: seedConfigMap.eventLocationEn || "at Xen Hotel, Mueang Nakhon Pathom, Nakhon Pathom",
  regisDeadlineText: seedConfigMap.regisDeadlineText || "20 พฤศจิกายน 2569",
  regisLink: seedConfigMap.regisLink || "https://kmutt.me/oph_Ratchaburi",
  openChatLink: seedConfigMap.openChatLink || "https://kmutt.me/OpenChatOPH2025",
  mapUrl: seedConfigMap.mapUrl || "https://maps.google.com/?q=Xen+Hotel+Nakhon+Pathom",
  coordinatorName: seedConfigMap.coordinatorName || "คุณศราวุฒิ จันทร์แฉล้ม",
  coordinatorPhone: seedConfigMap.coordinatorPhone || "032-726510",
  coordinatorEmail: seedConfigMap.coordinatorEmail || "sarawut.jun@kmutt.ac.th",
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
  [key: string]: unknown;
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

