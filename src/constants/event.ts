export const EVENT_CONFIG = {
    name: "KMUTT Open House",
    subName: "เปิดเฮือน มจธ. (มดอีสาน)",
    fullTitle: "KMUTT Open House - เปิดเฮือน มจธ. (มดอีสาน)",
    year: "2569",
    date: "30/10/2026",
    dateThai: "30 ตุลาคม 2569",
    dateDayThai: "วันศุกร์ที่ 30 ตุลาคม 2569",
    time: "09.00 – 16.00 น.",
    location: "ณ โรงแรมเพชรรัชต์การ์เด้น อ.เมือง จ.ร้อยเอ็ด",
    locationShort: "โรงแรมเพชรรัชต์การ์เด้น จ.ร้อยเอ็ด",
    googleMapUrl: "https://maps.google.com/?q=Petcharat+Garden+Hotel+Roi+Et",
    registrationDeadline: "26 ตุลาคม 2569",
    registrationLink: "https://kmutt.me/oph_RoiEt",
    openChatLink: "https://kmutt.me/OpenChatOPH2025",
    coordinator: {
        name: "นางสาวสุวะรักษ์ ศิริวรรณ์",
        phone: "0 2470 8471",
        email: "admission@kmutt.ac.th",
    },
    availableDates: ["30/10/2026"],
    rounds: [
        { id: 1, label: "รอบเช้า", time: "09.00 – 12.00 น." },
        { id: 2, label: "รอบบ่าย", time: "13.00 – 16.00 น." },
    ],
    dateColors: {
        "30/10/2026": "orange",
        "2026-10-30": "orange",
        // Legacy fallback
        "10/10/2025": "yellow",
        "11/10/2025": "green",
        "12/10/2025": "blue",
    } as Record<string, string>,
    surveyModal: {
        // Starts on event day: 30 October 2026 00:00:00 (UTC+7)
        startDate: process.env.NEXT_PUBLIC_SURVEY_START_DATE || "2026-10-30T00:00:00+07:00",
        // Stops 7 days after the event: 6 November 2026 23:59:59 (UTC+7)
        endDate: process.env.NEXT_PUBLIC_SURVEY_END_DATE || "2026-11-06T23:59:59+07:00",
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

