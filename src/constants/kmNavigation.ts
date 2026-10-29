import React from "react"
import {
    MdDashboard,
    MdPerson,
    MdAddBusiness,
    MdLogout,
    MdCalendarToday,
    MdStorefront,
    MdImage,
    MdTune,
    MdPoll,
    MdAssessment,
} from "react-icons/md"

export interface KMMenuItem {
    label?: string
    icon?: React.ComponentType<{ size?: number; className?: string }>
    link?: string
    divider?: boolean
    isLogout?: boolean
}

export const KM_MENU_ITEMS: KMMenuItem[] = [
    { label: "กิจกรรมทั้งหมด", icon: MdDashboard, link: "/_km/dashboard" },
    { label: "เพิ่มกิจกรรม", icon: MdAddBusiness, link: "/_km/activity/add" },
    { label: "จัดการ Staff", icon: MdPerson, link: "/_km/staff" },
    { divider: true },
    { label: "จัดการ Banner หน้าแรก", icon: MdImage, link: "/_km/landing-banner" },
    { label: "จัดการข้อความหน้าแรก", icon: MdTune, link: "/_km/landing-settings" },
    { label: "จัดการกำหนดการหน้าแรก", icon: MdCalendarToday, link: "/_km/landing-schedule" },
    { label: "จัดการบูท & โซนหน้าแรก", icon: MdStorefront, link: "/_km/landing-booth" },
    { divider: true },
    { label: "ตั้งค่าแบบสอบถาม", icon: MdPoll, link: "/_km/survey-settings" },
    { label: "รายงานผลแบบสอบถาม", icon: MdAssessment, link: "/survey-report" },
    { divider: true },
    { label: "ออกจากระบบ", icon: MdLogout, isLogout: true },
]
