"use client"

import { useEffect, useState } from "react"
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
    IconButton,
    Input,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
} from "@chakra-ui/react"
import KMLayout from "@/views/layouts/KMLayout"
import KMProfileCard from "@/components/ProfileCard/KMProfileCard"
import KMAppLayout from "@/views/layouts/KMAppLayout"
import { KMProfile } from "@/interfaces/KMProfile"
import { Activity } from "@/interfaces/Activities"
import { EditIcon } from "@chakra-ui/icons"
import { useRouter } from "next/router"

const ITEMS_PER_PAGE = 5

const KMDashboardPage = () => {
    const router = useRouter()
    const cardBg = useColorModeValue("white", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")

    const [data, setData] = useState<KMProfile | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [searchKeyword, setSearchKeyword] = useState("")

    // state เก็บ current page ของแต่ละวัน
    const [pageByDate, setPageByDate] = useState<Record<string, number>>({})

    useEffect(() => {
        fetch("/api/km/profile")
            .then((res) => res.json())
            .then((d) => setData(d))

        fetch("/api/km/activities")
            .then((res) => res.json())
            .then((d) => setActivities(d))
    }, [])

    if (!data) {
        return (
            <KMLayout>
                <Flex justify="center" align="center" minH="60vh">
                    <Text>กำลังโหลดข้อมูล KMUTT Account...</Text>
                </Flex>
            </KMLayout>
        )
    }

    const handleEdit = (id: number) => {
        router.push(`/_km/activity/view/${id}`)
    }

    const activityColors: Record<string, string> = {
        workshop: "blue",
        regis_activity: "green",
        non_regis_activity: "orange",
    }

    const dateColors: Record<string, string> = {
        "30/10/2026": "orange",
        "2026-10-30": "orange",
        "10/10/2025": "yellow",
        "11/10/2025": "green",
        "12/10/2025": "blue",
    }

    const distinctDates = Array.from(new Set(activities.map((a) => a.date))).filter(Boolean)
    const availableDates = distinctDates.length > 0 ? distinctDates : ["30/10/2026"]

    // ฟิลเตอร์ตาม keyword ก่อน
    const filteredActivities = activities.filter((act) => {
        const keyword = searchKeyword.toLowerCase()
        return (
            act.title.toLowerCase().includes(keyword) ||
            act.description.toLowerCase().includes(keyword)
        )
    })

    // แยกกิจกรรมตามวัน + sort ตามเวลา
    const activitiesByDate = availableDates.reduce((acc, date) => {
        acc[date] = filteredActivities
            .filter((act) => act.date === date)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
        return acc
    }, {} as Record<string, Activity[]>)

    return (
        <KMAppLayout navigation="Dashboard">
            <Box>
                <KMProfileCard data={data} />
                <Divider mt="-1" mb={6} />

                {/* Landing Page Management Banner */}
                <Box
                    p={{ base: 4, md: 5 }}
                    bg={useColorModeValue("orange.50", "whiteAlpha.100")}
                    border="1px solid"
                    borderColor={useColorModeValue("orange.200", "orange.700")}
                    rounded="2xl"
                    mb={6}
                >
                    <Flex
                        direction={{ base: "column", md: "row" }}
                        justify="space-between"
                        align={{ base: "flex-start", md: "center" }}
                        gap={4}
                    >
                        <Box>
                            <HStack spacing={2} mb={1}>
                                <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5} rounded="md">
                                    ระบบจัดการหน้าแรก
                                </Badge>
                                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color="#F04E23">
                                    จัดการกำหนดการ & บูทกิจกรรมหน้าแรก (Landing Content)
                                </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                                เพิ่ม แก้ไข ลบ กำหนดการจัดกิจกรรม (เวลา) และ บูทแนะนำหลักสูตร (โซน 1, โซน 2, โซน 3)
                            </Text>
                        </Box>
                        <HStack spacing={3} wrap="wrap">
                            <Button
                                size="sm"
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => router.push("/_km/landing-schedule")}
                            >
                                จัดการกำหนดการ (Schedule)
                            </Button>
                            <Button
                                size="sm"
                                colorScheme="orange"
                                onClick={() => router.push("/_km/landing-booth")}
                            >
                                จัดการบูท & โซน (Booths)
                            </Button>
                        </HStack>
                    </Flex>
                </Box>

                <Box>

                    {/* Header */}
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="md" fontWeight="bold" color={textColor}>
                            กิจกรรมทั้งหมด
                        </Text>

                        <Button
                            size="sm"
                            colorScheme="orange"
                            onClick={() => router.push("/_km/activity/add")}
                        >
                            + เพิ่มกิจกรรม
                        </Button>
                    </HStack>

                    {/* Search Box */}
                    <Input
                        placeholder="ค้นหากิจกรรม..."
                        size="sm"
                        mb={4}
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value)
                            setPageByDate({})
                        }}
                    />

                    {/* Tabs by date */}
                    <Tabs variant="enclosed" colorScheme="blue">
                        <TabList>
                            {availableDates.map((date) => (
                                <Tab key={date}>{date}</Tab>
                            ))}
                        </TabList>

                        <TabPanels>
                            {availableDates.map((date) => {
                                const currentPage = pageByDate[date] || 1
                                const totalPages = Math.ceil(
                                    activitiesByDate[date].length / ITEMS_PER_PAGE
                                )
                                const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
                                const currentActivities = activitiesByDate[date].slice(
                                    startIndex,
                                    startIndex + ITEMS_PER_PAGE
                                )

                                return (
                                    <TabPanel key={date}>
                                        <VStack align="stretch" spacing={4}>
                                            {currentActivities.length === 0 ? (
                                                <Text fontSize="sm" color="gray.500">
                                                    ไม่พบกิจกรรมที่ตรงกับคำค้น
                                                </Text>
                                            ) : (
                                                currentActivities.map((act) => (
                                                    <Box
                                                        key={act.id}
                                                        p={4}
                                                        bg={cardBg}
                                                        cursor={"pointer"}
                                                        rounded="xl"
                                                        onClick={() => handleEdit(act.id)}
                                                        shadow="sm"
                                                        border={act.display ? "none" : "2px solid red"}
                                                    //blur
                                                    //blur and disable color
                                                    // style={act.display ? {} : { opacity: 0.5 }}
                                                    >

                                                        {!act.display && (
                                                            <Badge w={"full"} rounded={"md"} p={2} colorScheme="red">กิจกรรมนี้ไม่ได้แสดงให้นักเรียนเห็น</Badge>
                                                        )}
                                                        <HStack justify="space-between" mb={2}>

                                                            <Text fontSize="md" fontWeight="bold">
                                                                #{act.id} {act.title}
                                                            </Text>
                                                            <HStack spacing={2}>
                                                                <Badge
                                                                    colorScheme={
                                                                        activityColors[act.activity_type] || "gray"
                                                                    }
                                                                >
                                                                    {act.activity_type.replace("_", " ")}
                                                                </Badge>
                                                                <IconButton
                                                                    aria-label="Edit activity"
                                                                    icon={<EditIcon />}
                                                                    size="sm"
                                                                    onClick={() => handleEdit(act.id)}
                                                                />
                                                            </HStack>
                                                        </HStack>

                                                        <Text fontSize="sm" color={textColor} noOfLines={3}>
                                                            {act.description}
                                                        </Text>

                                                        <Text fontSize="xs" mt={2} color="gray.500">
                                                            📍 {act.location} | 🏫{" "}
                                                            {act.faculty?.name_th} - {act.department?.name_th}
                                                        </Text>

                                                        <HStack spacing={2} mb={1} align="center">
                                                            <Badge
                                                                colorScheme={dateColors[act.date] || "gray"}
                                                                fontSize="1rem"
                                                                fontWeight="bold"
                                                            >
                                                                วันที่: {act.date} (รอบ {act.round})
                                                            </Badge>
                                                            <Badge
                                                                colorScheme="orange"
                                                                fontSize="1rem"
                                                                fontWeight="bold"
                                                            >
                                                                เวลา: {act.start_time} - {act.end_time}
                                                            </Badge>
                                                        </HStack>

                                                        {act.activity_type !== "non_regis_activity" && (
                                                            <Text
                                                                fontSize="md"
                                                                color="orange.500"
                                                                fontWeight="bold"
                                                            >
                                                                {act.current_register_participants ===
                                                                    act.max_participants
                                                                    ? "✅ เต็มแล้ว"
                                                                    : `${act.current_register_participants} / ${act.max_participants} คน`}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                ))
                                            )}
                                        </VStack>

                                        {/* Pagination */}
                                        {
                                            totalPages > 1 && (
                                                <HStack justify="center" spacing={2} mt={6}>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            setPageByDate((prev) => ({
                                                                ...prev,
                                                                [date]: Math.max(1, currentPage - 1),
                                                            }))
                                                        }
                                                        isDisabled={currentPage === 1}
                                                    >
                                                        ก่อนหน้า
                                                    </Button>

                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <Button
                                                            key={i}
                                                            size="sm"
                                                            variant={
                                                                currentPage === i + 1 ? "solid" : "outline"
                                                            }
                                                            colorScheme="blue"
                                                            onClick={() =>
                                                                setPageByDate((prev) => ({
                                                                    ...prev,
                                                                    [date]: i + 1,
                                                                }))
                                                            }
                                                        >
                                                            {i + 1}
                                                        </Button>
                                                    ))}

                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            setPageByDate((prev) => ({
                                                                ...prev,
                                                                [date]: Math.min(totalPages, currentPage + 1),
                                                            }))
                                                        }
                                                        isDisabled={currentPage === totalPages}
                                                    >
                                                        ถัดไป
                                                    </Button>
                                                </HStack>
                                            )
                                        }
                                    </TabPanel>
                                )
                            })}
                        </TabPanels>
                    </Tabs>
                </Box>
            </Box>
        </KMAppLayout >
    )
}

export { KMDashboardPage }
