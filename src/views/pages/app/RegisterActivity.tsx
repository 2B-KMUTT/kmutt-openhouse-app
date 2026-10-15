"use client"

import { useEffect, useState } from "react"
import StudentAppLayout from "@/views/layouts/StudentAppLayout"
import {
    Box,
    Flex,
    Heading,
    Text,
    Spinner,
    VStack,
    Badge,
    Button,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import Head from "next/head"

interface Activity {
    id: number
    title: string
    description: string
    date: string
    round: number
    start_time: string
    end_time: string
    location: string
    point: number
    max_participants: number
    current_register_participants: number
    activity_type: string
    department: { id: number; name_th: string; name_en: string }
    faculty: { id: number; name_th: string; name_en: string }
}

const RegisterActivityPage = () => {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const bgColor = useColorModeValue("white", "gray.700")
    const textColor = useColorModeValue("gray.700", "gray.400")

    const fetchRegisteredActivities = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/student/activities/registered")
            if (!res.ok) throw new Error("Failed to fetch activities")
            const data: Activity[] = await res.json()
            setActivities(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRegisteredActivities()
    }, [])

    const dateColors: Record<string, string> = {
        "30/10/2026": "orange",
        "2026-10-30": "orange",
        "30-10-2026": "orange",
        "10/10/2025": "yellow",
        "10-10-2025": "yellow",
        "2025-10-10": "yellow",
        "11/10/2025": "green",
        "11-10-2025": "green",
        "2025-10-11": "green",
        "12/10/2025": "blue",
        "12-10-2025": "blue",
        "2025-10-12": "blue",
    }

    const activityTypeLabel: Record<string, string> = {
        workshop: "Workshop",
        regis_activity: "กิจกรรมที่ต้องลงทะเบียน",
        non_regis_activity: "กิจกรรมทั่วไป",
    };

    return (
        <StudentAppLayout navigation="กิจกรรมที่ลงทะเบียน">
            <Head>
                <title>Openhouse / กิจกรรมที่ลงทะเบียน</title>
            </Head>
            <Box mx="auto" py={0}>
                {loading ? (
                    <Flex justify="center" align="center" minH="40vh">
                        <Spinner size="xl" />
                    </Flex>
                ) : activities.length === 0 ? (
                    <Text color="gray.500">คุณยังไม่ได้ลงทะเบียนเข้าร่วมกิจกรรมใด ๆ</Text>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {activities.map((act) => (
                            <Box key={act.id} p={4} bg={bgColor} rounded="xl" shadow="sm">
                                <HStack justify="space-between" mb={2}>
                                    <Text fontSize="md" noOfLines={2} fontWeight="bold">{act.title}</Text>
                                    <Badge colorScheme={
                                        act.activity_type === "workshop"
                                            ? "blue"
                                            : act.activity_type === "regis_activity"
                                                ? "green"
                                                : "orange"
                                    }>
                                        {act.activity_type === "workshop"
                                            ? "Workshop"
                                            : act.activity_type === "regis_activity"
                                                ? "กิจกรรมที่ต้องลงทะเบียน"
                                                : "กิจกรรมทั่วไป"}
                                    </Badge>
                                </HStack>

                                <Text fontSize="sm" color={textColor} noOfLines={2} mb={1}>
                                    {act.description}
                                </Text>

                                <HStack spacing={2} mb={1} align="center">

                                    <Badge colorScheme={dateColors[act.date] || "gray"} fontSize="1rem" fontWeight="bold">
                                        วันที่: {act.date} (รอบ {act.round})
                                    </Badge>
                                    <Badge colorScheme="orange" fontSize="1rem" fontWeight="bold">
                                        เวลา: {act.start_time} - {act.end_time}
                                    </Badge>
                                </HStack>

                                <Text fontSize="sm" color="gray.500">
                                    สถานที่: {act.location} | คณะ: {act.faculty.name_th} - ภาควิชา: {act.department.name_th}
                                </Text>
                                <Flex justifyContent={"flex-end"}>
                                    <Button

                                        mt={2}
                                        size="sm"
                                        w={{ base: "full", md: "auto" }}
                                        colorScheme="blue"
                                        onClick={() => router.push(`/app/activity/${act.id}`)}
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                )}
            </Box>
        </StudentAppLayout>
    )
}

export { RegisterActivityPage }
