import landingConfigsSeed from "../../prisma/data/landing-configs.json";

const seedConfigMap: Record<string, string> = {};
for (const item of landingConfigsSeed) {
    seedConfigMap[item.key] = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
}

export const EVENT_CONFIG = {
    name: seedConfigMap.heroTitle || "KMUTT Open House",
    subName: seedConfigMap.heroSubtitle || "เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม",
    fullTitle: `${seedConfigMap.heroTitle || "KMUTT Open House"} - ${seedConfigMap.heroSubtitle || "เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม"}`,
    year: "2569",
    date: "21/11/2026",
    dateThai: "21 พฤศจิกายน 2569",
    dateDayThai: seedConfigMap.heroDateText ? seedConfigMap.heroDateText.split(" เวลา")[0] : "วันเสาร์ที่ 21 พฤศจิกายน 2569",
    time: "09.00 – 15.00 น.",
    location: seedConfigMap.eventLocationTh || "ณ โรงแรมเซ็น อ.เมืองนครปฐม จ.นครปฐม",
    locationShort: "โรงแรมเซ็น จ.นครปฐม",
    googleMapUrl: seedConfigMap.mapUrl || "https://maps.google.com/?q=Xen+Hotel+Nakhon+Pathom",
    registrationDeadline: seedConfigMap.regisDeadlineText || "20 พฤศจิกายน 2569",
    registrationLink: seedConfigMap.regisLink || "https://kmutt.me/oph_Ratchaburi",
    openChatLink: seedConfigMap.openChatLink || "https://kmutt.me/OpenChatOPH2025",
    coordinator: {
        name: seedConfigMap.coordinatorName || "คุณศราวุฒิ จันทร์แฉล้ม",
        phone: seedConfigMap.coordinatorPhone || "032-726510",
        email: seedConfigMap.coordinatorEmail || "sarawut.jun@kmutt.ac.th",
    },
    availableDates: ["21/11/2026", "30/10/2026"],
    rounds: [
        { id: 1, label: "รอบเช้า", time: "09.00 – 12.00 น." },
        { id: 2, label: "รอบบ่าย", time: "12.00 – 15.00 น." },
    ],
    dateColors: {
        "21/11/2026": "orange",
        "2026-11-21": "orange",
        "30/10/2026": "orange",
        "2026-10-30": "orange",
    } as Record<string, string>,
    surveyModal: {
        // Starts on event day: 21 November 2026 00:00:00 (UTC+7)
        startDate: process.env.NEXT_PUBLIC_SURVEY_START_DATE || seedConfigMap.surveyStartDate || "2026-11-21T00:00:00+07:00",
        // Stops 7 days after the event: 28 November 2026 23:59:59 (UTC+7)
        endDate: process.env.NEXT_PUBLIC_SURVEY_END_DATE || seedConfigMap.surveyEndDate || "2026-11-28T23:59:59+07:00",
    },
};

/**
 * Returns whether the survey modal should be active based on current date
 */
export const isSurveyModalActive = (currentDate: Date = new Date()): boolean => {
    const start = new Date(EVENT_CONFIG.surveyModal.startDate);
    const end = new Date(EVENT_CONFIG.surveyModal.endDate);
    return currentDate >= start && currentDate <= end;
};

