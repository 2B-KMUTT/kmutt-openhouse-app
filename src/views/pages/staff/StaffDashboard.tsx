"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Flex,
    Text,
    Box,
    useColorModeValue,
    Divider,
    VStack,
    HStack,
    Badge,
    Button,
    Spinner,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from "@chakra-ui/react"
import { QrCode } from "lucide-react"

import StaffAppLayout from "@/views/layouts/StaffAppLayout"
import StaffProfileCard from "@/components/ProfileCard/StaffProfileCard"
import StaffLayout from "@/views/layouts/StaffLayout"
import { StaffProfile } from "@/interfaces/KMProfile"
import { useRouter } from "next/router"

type Activity = {
    id: number
    title: string
    description: string
    date: string
    start_time: string
    end_time: string
    location: string
    point: number
    max_participants: number
    registrations: {
        id: number
        student: {
            first_name: string
            last_name: string
            email: string
            phone: string
        }
        registered_at: string
    }[]
}

const StaffDashboard = () => {
    const router = useRouter()
    const cardBg = useColorModeValue("white", "gray.700")
    const highlightBg = useColorModeValue("orange.50", "orange.900")
    const ongoingGlow = useColorModeValue("0 0 12px rgba(255,140,0,0.4)", "0 0 18px rgba(255,140,0,0.7)")
    const cardBorder = useColorModeValue("orange.400", "orange.500")
    const [profile, setProfile] = useState<StaffProfile | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [now, setNow] = useState<Date>(new Date())

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return ""
        if (dateStr.includes("/")) {
            const [day, month, year] = dateStr.split("/")
            const parsed = new Date(`${year}-${month}-${day}`)
            if (!isNaN(parsed.getTime())) {
                return parsed.toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })
            }
            return dateStr
        }
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })
        }
        return dateStr
    }

    const eventDates = useMemo(() => {
        const distinct = Array.from(new Set(activities.map((a) => a.date))).filter(Boolean)
        return distinct.length > 0 ? distinct : ["30/10/2026"]
    }, [activities])

    useEffect(() => {
        fetch("/api/staff/profile")
            .then((res) => res.json())
            .then((d) => setProfile(d))
    }, [])

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true)
            const res = await fetch("/api/staff/my-activity")
            if (res.ok) {
                const data = await res.json()
                // เรียงกิจกรรมตามเวลา
                const sorted = data.sort(
                    (a: Activity, b: Activity) => {
                        const aDate = a.date?.includes("/") ? a.date.split("/").reverse().join("-") : a.date
                        const bDate = b.date?.includes("/") ? b.date.split("/").reverse().join("-") : b.date
                        return new Date(`${aDate}T${a.start_time}`).getTime() -
                               new Date(`${bDate}T${b.start_time}`).getTime()
                    }
                )
                setActivities(sorted)
            }
            setLoading(false)
        }
        fetchActivities()
    }, [])

    // อัปเดตเวลาปัจจุบันทุก 60 วินาที
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const scan = (activity: Activity) => {
        router.push(`/staff/scan/${activity.id}`)
    }

    const isOngoing = (act: Activity) => {
        if (!act.date || !act.start_time || !act.end_time) return false
        // แปลงวันที่จาก "DD/MM/YYYY" → "YYYY-MM-DD"
        let isoDate = act.date
        if (act.date.includes("/")) {
            const [day, month, year] = act.date.split("/")
            isoDate = `${year}-${month}-${day}`
        }

        // สร้างเวลาแบบ ISO ที่ JS อ่านได้
        const start = new Date(`${isoDate}T${act.start_time}:00`)
        const end = new Date(`${isoDate}T${act.end_time}:00`)

        return now >= start && now <= end
    }

    const groupedActivities = useMemo(() => {
        const groups: Record<string, Activity[]> = {}
        for (const date of eventDates) groups[date] = []
        activities.forEach((a) => {
            if (groups[a.date]) groups[a.date].push(a)
        })
        return groups
    }, [activities, eventDates])

    if (!profile) {
        return (
            <StaffLayout>
                <Flex justify="center" align="center" minH="60vh">
                    <Text>กำลังโหลดข้อมูล Staff Account...</Text>
                </Flex>
            </StaffLayout>
        )
    }

    return (
        <StaffAppLayout navigation="Dashboard">
            <Box>
                <StaffProfileCard data={profile} />
                <Divider mt="-1" mb={6} />

                <Text fontSize="lg" fontWeight="bold" mb={3}>
                    กิจกรรมที่ฉันดูแล
                </Text>

                {loading ? (
                    <Flex justify="center" py={10}>
                        <Spinner size="xl" />
                    </Flex>
                ) : (
                    <Tabs colorScheme="orange" variant="soft-rounded">
                        <TabList>
                            {eventDates.map((d) => (
                                <Tab key={d}>
                                    {formatDisplayDate(d)}
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels mt={4}>
                            {eventDates.map((d) => {
                                const acts = groupedActivities[d] || []
                                return (
                                    <TabPanel key={d}>
                                        {acts.length === 0 ? (
                                            <Text>ไม่มีข้อมูลกิจกรรมในวันนี้</Text>
                                        ) : (
                                            <VStack spacing={4} align="stretch">
                                                {acts.map((act) => {
                                                    const ongoing = isOngoing(act)
                                                    return (
                                                        <Box
                                                            key={act.id}
                                                            p={5}
                                                            bg={ongoing ? highlightBg : cardBg}
                                                            borderRadius="2xl"
                                                            shadow={ongoing ? "xl" : "sm"}
                                                            border={
                                                                ongoing ? `2px solid ${cardBorder}` : undefined
                                                            }
                                                            boxShadow={ongoing ? ongoingGlow : undefined}
                                                            transition="all 0.4s ease"
                                                        >
                                                            <HStack justify="space-between" mb={2}>
                                                                <HStack spacing={2}>
                                                                    {ongoing && (
                                                                        <Icon as={QrCode} color="orange.500" />
                                                                    )}
                                                                    <Text
                                                                        fontSize="md"
                                                                        fontWeight="bold"
                                                                    >
                                                                        {act.title}
                                                                    </Text>
                                                                </HStack>

                                                                <Button
                                                                    size="md"
                                                                    colorScheme="orange"
                                                                    borderRadius="full"
                                                                    onClick={() => scan(act)}
                                                                >
                                                                    SCAN
                                                                </Button>

                                                            </HStack>

                                                            <Text color="gray.600" mb={2}>
                                                                {act.description}
                                                            </Text>

                                                            <HStack spacing={3} wrap="wrap" mb={1}>
                                                                <Badge colorScheme="blue">
                                                                    เวลา: {act.start_time} - {act.end_time}
                                                                </Badge>
                                                                <Badge colorScheme="purple">
                                                                    สถานที่: {act.location}
                                                                </Badge>
                                                                {ongoing && (
                                                                    <Badge colorScheme="orange">
                                                                        กำลังดำเนินอยู่
                                                                    </Badge>
                                                                )}
                                                            </HStack>

                                                            <Text
                                                                fontSize="sm"
                                                                color="gray.500"
                                                            >
                                                                คะแนน: {act.point} | ผู้ลงทะเบียน:{" "}
                                                                {act.registrations.length} /{" "}
                                                                {act.max_participants}
                                                            </Text>
                                                        </Box>
                                                    )
                                                })}
                                            </VStack>
                                        )}
                                    </TabPanel>
                                )
                            })}
                        </TabPanels>
                    </Tabs>
                )}
            </Box>
        </StaffAppLayout>
    )
}

export { StaffDashboard }
