export const EVENT_CONFIG = {
    name: "KMUTT Open House",
    subName: "เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม",
    fullTitle: "KMUTT Open House - เปิดบ้าน KMUTT Ratchaburi มดออนทัวร์ @นครปฐม",
    year: "2569",
    date: "21/11/2026",
    dateThai: "21 พฤศจิกายน 2569",
    dateDayThai: "วันเสาร์ที่ 21 พฤศจิกายน 2569",
    time: "09.00 – 15.00 น.",
    location: "ณ โรงแรมเซ็น อ.เมืองนครปฐม จ.นครปฐม",
    locationShort: "โรงแรมเซ็น จ.นครปฐม",
    googleMapUrl: "https://maps.google.com/?q=Xen+Hotel+Nakhon+Pathom",
    registrationDeadline: "20 พฤศจิกายน 2569",
    registrationLink: "https://kmutt.me/oph_Ratchaburi",
    openChatLink: "https://kmutt.me/OpenChatOPH2025",
    coordinator: {
        name: "คุณศราวุฒิ จันทร์แฉล้ม",
        phone: "032-726510",
        email: "sarawut.jun@kmutt.ac.th",
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
        startDate: process.env.NEXT_PUBLIC_SURVEY_START_DATE || "2026-11-21T00:00:00+07:00",
        // Stops 7 days after the event: 28 November 2026 23:59:59 (UTC+7)
        endDate: process.env.NEXT_PUBLIC_SURVEY_END_DATE || "2026-11-28T23:59:59+07:00",
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

