"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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
    InputGroup,
    InputLeftElement,
    Select,
    Tabs,
    Tab,
    TabList,
    TabPanels,
    TabPanel,
    Card,
    CardBody,
} from "@chakra-ui/react"
import KMLayout from "@/views/layouts/KMLayout"
import KMProfileCard from "@/components/ProfileCard/KMProfileCard"
import KMAppLayout from "@/views/layouts/KMAppLayout"
import { KMProfile } from "@/interfaces/KMProfile"
import { Activity } from "@/interfaces/Activities"
import { EditIcon, SearchIcon, AddIcon } from "@chakra-ui/icons"
import { useRouter } from "next/router"
import { PRIMARY } from "@/constants/colors"

const ITEMS_PER_PAGE = 5

const KMDashboardPage = () => {
    const router = useRouter()
    const { data: session } = useSession()
    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN"

    const cardBg = useColorModeValue("white", "gray.750")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const subTextColor = useColorModeValue("gray.500", "gray.400")
    const bannerBg = useColorModeValue("orange.50", "whiteAlpha.100")
    const bannerBorderColor = useColorModeValue("orange.200", "orange.700")

    const [data, setData] = useState<KMProfile | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [searchKeyword, setSearchKeyword] = useState("")
    const [adminOwners, setAdminOwners] = useState<{ id: number, name: string, username: string }[]>([])
    const [selectedOwnerFilter, setSelectedOwnerFilter] = useState<number | "">("")

    // state เก็บ current page ของแต่ละวัน
    const [pageByDate, setPageByDate] = useState<Record<string, number>>({})

    const fetchActivities = (ownerId?: number | "") => {
        const query = ownerId ? `?ownerId=${ownerId}` : ""
        fetch(`/api/km/activities${query}`)
            .then((res) => res.json())
            .then((d) => setActivities(Array.isArray(d) ? d : []))
            .catch(() => {})
    }

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then((res) => res.json())
                .then((d) => setAdminOwners(Array.isArray(d) ? d : []))
                .catch(() => {})
        }
    }, [isSuperAdmin])

    useEffect(() => {
        fetch("/api/km/profile")
            .then((res) => res.json())
            .then((d) => setData(d))

        fetchActivities()
    }, [])

    const handleOwnerFilterChange = (val: string) => {
        const ownerId = val ? Number(val) : ""
        setSelectedOwnerFilter(ownerId)
        fetchActivities(ownerId)
        setPageByDate({})
    }

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

    const activityBadgeColorScheme: Record<string, string> = {
        workshop: "blue",
        regis_activity: "green",
        non_regis_activity: "orange",
    }

    const distinctDates = Array.from(new Set(activities.map((a) => a.date))).filter(Boolean)
    const availableDates = distinctDates.length > 0 ? distinctDates : ["30/10/2026"]

    // ฟิลเตอร์ตาม keyword
    const filteredActivities = activities.filter((act) => {
        const keyword = searchKeyword.toLowerCase()
        return (
            act.title?.toLowerCase().includes(keyword) ||
            act.description?.toLowerCase().includes(keyword) ||
            act.location?.toLowerCase().includes(keyword) ||
            act.department?.name_th?.toLowerCase().includes(keyword)
        )
    })

    // แยกกิจกรรมตามวัน + sort ตามเวลา
    const activitiesByDate = availableDates.reduce((acc, date) => {
        acc[date] = filteredActivities
            .filter((act) => act.date === date)
            .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
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
                    bg={bannerBg}
                    border="1px solid"
                    borderColor={bannerBorderColor}
                    rounded="xl"
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
                                <Badge colorScheme="orange" variant="subtle" fontSize="xs" px={2} py={0.5} rounded="md">
                                    Control Center
                                </Badge>
                                <Text fontWeight="bold" fontSize="sm" color={PRIMARY}>
                                    ศูนย์ควบคุมข้อมูลหน้าแรก & แบบสอบถาม
                                </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                                จัดการ Banner สไลด์, ข้อความประชาสัมพันธ์, กำหนดการ, บูทคณะ และแบบสอบถามภาพรวม
                            </Text>
                        </Box>
                        <HStack spacing={2} wrap="wrap">
                            <Button
                                size="xs"
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => router.push("/_km/landing-banner")}
                            >
                                แบนเนอร์
                            </Button>
                            <Button
                                size="xs"
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => router.push("/_km/landing-settings")}
                            >
                                ข้อความหน้าแรก
                            </Button>
                            <Button
                                size="xs"
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => router.push("/_km/landing-schedule")}
                            >
                                กำหนดการ
                            </Button>
                            <Button
                                size="xs"
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => router.push("/_km/landing-booth")}
                            >
                                บูท & โซน
                            </Button>
                            <Button
                                size="xs"
                                colorScheme="orange"
                                onClick={() => router.push("/_km/survey-settings")}
                            >
                                แบบสอบถาม
                            </Button>
                        </HStack>
                    </Flex>
                </Box>

                {/* Unified Toolbar: Search + Filter + Add Button */}
                <Card variant="outline" borderColor={borderColor} mb={6}>
                    <CardBody p={4}>
                        <Flex
                            direction={{ base: "column", lg: "row" }}
                            gap={3}
                            align={{ base: "stretch", lg: "center" }}
                            justify="space-between"
                        >
                            {/* Search Box */}
                            <InputGroup size="sm" maxW={{ base: "full", lg: "360px" }}>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="ค้นหากิจกรรม..."
                                    rounded="lg"
                                    focusBorderColor="orange.500"
                                    value={searchKeyword}
                                    onChange={(e) => {
                                        setSearchKeyword(e.target.value)
                                        setPageByDate({})
                                    }}
                                />
                            </InputGroup>

                            {/* Filters & Action */}
                            <HStack spacing={3} wrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }}>
                                {isSuperAdmin && (
                                    <HStack spacing={2}>
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.500" whiteSpace="nowrap">
                                            คณะ:
                                        </Text>
                                        <Select
                                            size="sm"
                                            rounded="lg"
                                            focusBorderColor="orange.500"
                                            maxW="240px"
                                            value={selectedOwnerFilter}
                                            onChange={(e) => handleOwnerFilterChange(e.target.value)}
                                        >
                                            <option value="">ทุกคณะ (ทั้งหมด)</option>
                                            {adminOwners.map((admin) => (
                                                <option key={admin.id} value={admin.id}>
                                                    {admin.name} ({admin.username})
                                                </option>
                                            ))}
                                        </Select>
                                        {selectedOwnerFilter && (
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="orange"
                                                onClick={() => handleOwnerFilterChange("")}
                                            >
                                                ล้าง
                                            </Button>
                                        )}
                                    </HStack>
                                )}

                                <Button
                                    size="sm"
                                    colorScheme="orange"
                                    leftIcon={<AddIcon />}
                                    onClick={() => router.push("/_km/activity/add")}
                                >
                                    เพิ่มกิจกรรม
                                </Button>
                            </HStack>
                        </Flex>
                    </CardBody>
                </Card>

                {/* Tabs by date */}
                <Tabs variant="enclosed" colorScheme="orange">
                    <TabList>
                        {availableDates.map((date) => (
                            <Tab key={date} fontWeight="semibold" fontSize="xs">
                                📅 {date} ({activitiesByDate[date]?.length || 0})
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {availableDates.map((date) => {
                            const currentPage = pageByDate[date] || 1
                            const totalPages = Math.ceil(
                                (activitiesByDate[date]?.length || 0) / ITEMS_PER_PAGE
                            )
                            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
                            const currentActivities = (activitiesByDate[date] || []).slice(
                                startIndex,
                                startIndex + ITEMS_PER_PAGE
                            )

                            return (
                                <TabPanel key={date} px={0} pt={4}>
                                    <VStack align="stretch" spacing={3}>
                                        {currentActivities.length === 0 ? (
                                            <Box py={8} textAlign="center" color="gray.500">
                                                <Text fontSize="sm">ไม่พบกิจกรรมที่ตรงกับคำค้นหาหรือตัวกรอง</Text>
                                            </Box>
                                        ) : (
                                            currentActivities.map((act) => (
                                                <Card
                                                    key={act.id}
                                                    variant="outline"
                                                    borderColor={!act.display ? "red.300" : borderColor}
                                                    bg={cardBg}
                                                    cursor="pointer"
                                                    rounded="xl"
                                                    transition="all 0.15s ease"
                                                    _hover={{
                                                        borderColor: !act.display ? "red.400" : "orange.400",
                                                        shadow: "sm",
                                                    }}
                                                    onClick={() => handleEdit(act.id)}
                                                >
                                                    <CardBody p={4}>
                                                        {!act.display && (
                                                            <Badge
                                                                colorScheme="red"
                                                                variant="subtle"
                                                                fontSize="xs"
                                                                px={2}
                                                                py={0.5}
                                                                rounded="md"
                                                                mb={2}
                                                            >
                                                                ซ่อนอยู่ (ผู้เข้าร่วมงานไม่เห็นกิจกรรมนี้)
                                                            </Badge>
                                                        )}

                                                        <Flex
                                                            direction={{ base: "column", sm: "row" }}
                                                            justify="space-between"
                                                            align={{ base: "flex-start", sm: "center" }}
                                                            gap={2}
                                                            mb={2}
                                                        >
                                                            <HStack spacing={2} wrap="wrap">
                                                                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                                                    #{act.id} {act.title}
                                                                </Text>
                                                                {act.owner && isSuperAdmin && (
                                                                    <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                                                        {act.owner.name}
                                                                    </Badge>
                                                                )}
                                                            </HStack>

                                                            <HStack spacing={2}>
                                                                <Badge
                                                                    variant="subtle"
                                                                    colorScheme={
                                                                        activityBadgeColorScheme[act.activity_type] || "gray"
                                                                    }
                                                                    fontSize="xs"
                                                                >
                                                                    {act.activity_type.replace("_", " ")}
                                                                </Badge>
                                                                <IconButton
                                                                    aria-label="Edit activity"
                                                                    icon={<EditIcon />}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleEdit(act.id)
                                                                    }}
                                                                />
                                                            </HStack>
                                                        </Flex>

                                                        <Text fontSize="xs" color={subTextColor} noOfLines={2} mb={3}>
                                                            {act.description}
                                                        </Text>

                                                        <HStack
                                                            justify="space-between"
                                                            wrap="wrap"
                                                            pt={2}
                                                            borderTop="1px solid"
                                                            borderColor={borderColor}
                                                            fontSize="xs"
                                                            color="gray.500"
                                                        >
                                                            <HStack spacing={3} wrap="wrap">
                                                                <Text>📍 {act.location}</Text>
                                                                <Text>
                                                                    🏫 {act.faculty?.name_th}
                                                                    {act.department?.name_th ? ` - ${act.department?.name_th}` : ""}
                                                                </Text>
                                                                <Text>⏰ {act.start_time} - {act.end_time} (รอบ {act.round})</Text>
                                                            </HStack>

                                                            {act.activity_type !== "non_regis_activity" && (
                                                                <Badge
                                                                    variant="subtle"
                                                                    colorScheme={
                                                                        act.current_register_participants === act.max_participants
                                                                            ? "red"
                                                                            : "green"
                                                                    }
                                                                    fontSize="xs"
                                                                >
                                                                    {act.current_register_participants === act.max_participants
                                                                        ? "ผู้ลงทะเบียนเต็มแล้ว"
                                                                        : `ลงทะเบียน ${act.current_register_participants} / ${act.max_participants} คน`}
                                                                </Badge>
                                                            )}
                                                        </HStack>
                                                    </CardBody>
                                                </Card>
                                            ))
                                        )}
                                    </VStack>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <HStack justify="center" spacing={2} mt={6}>
                                            <Button
                                                size="xs"
                                                variant="outline"
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
                                                    size="xs"
                                                    variant={currentPage === i + 1 ? "solid" : "outline"}
                                                    colorScheme={currentPage === i + 1 ? "orange" : "gray"}
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
                                                size="xs"
                                                variant="outline"
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
                                    )}
                                </TabPanel>
                            )
                        })}
                    </TabPanels>
                </Tabs>
            </Box>
        </KMAppLayout>
    )
}

export { KMDashboardPage }