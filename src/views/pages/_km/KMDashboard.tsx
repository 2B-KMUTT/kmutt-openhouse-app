"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
    Flex,
    Text,
    Box,
    useColorModeValue,
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
    Avatar,
} from "@chakra-ui/react"
import KMLayout from "@/views/layouts/KMLayout"
import KMAppLayout from "@/views/layouts/KMAppLayout"
import { KMProfile } from "@/interfaces/KMProfile"
import { Activity } from "@/interfaces/Activities"
import { EditIcon, SearchIcon, AddIcon } from "@chakra-ui/icons"
import { useRouter } from "next/router"

const ITEMS_PER_PAGE = 8

const KMDashboardPage = () => {
    const router = useRouter()
    const { data: session } = useSession()
    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN"

    const borderColor = useColorModeValue("gray.200", "gray.600")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50")

    const [data, setData] = useState<KMProfile | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [searchKeyword, setSearchKeyword] = useState("")
    const [adminOwners, setAdminOwners] = useState<{ id: number, name: string, username: string }[]>([])
    const [selectedOwnerFilter, setSelectedOwnerFilter] = useState<number | "">("")

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
                    <Text fontSize="sm" color="gray.500">กำลังโหลดข้อมูล...</Text>
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

    const filteredActivities = activities.filter((act) => {
        const keyword = searchKeyword.toLowerCase()
        return (
            act.title?.toLowerCase().includes(keyword) ||
            act.description?.toLowerCase().includes(keyword) ||
            act.location?.toLowerCase().includes(keyword) ||
            act.department?.name_th?.toLowerCase().includes(keyword)
        )
    })

    const activitiesByDate = availableDates.reduce((acc, date) => {
        acc[date] = filteredActivities
            .filter((act) => act.date === date)
            .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
        return acc
    }, {} as Record<string, Activity[]>)

    return (
        <KMAppLayout navigation="Dashboard">
            {/* Header / Profile Strip (Flat, zero nested cards) */}
            <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                gap={3}
                pb={4}
                mb={4}
                borderBottom="1px solid"
                borderColor={borderColor}
            >
                <HStack spacing={3}>
                    <Avatar name={data.name} size="sm" bg="orange.500" color="white" />
                    <Box>
                        <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                {data.name}
                            </Text>
                            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                {isSuperAdmin ? "Super Admin" : "Faculty Admin"}
                            </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                            {data.username} • {data.email}
                        </Text>
                    </Box>
                </HStack>

                <HStack spacing={3} w={{ base: "full", sm: "auto" }} justify="flex-end">
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

            {/* Flat Toolbar: Search & Faculty Filter */}
            <Flex
                direction={{ base: "column", sm: "row" }}
                gap={3}
                align={{ base: "stretch", sm: "center" }}
                justify="space-between"
                mb={4}
            >
                <InputGroup size="sm" maxW={{ base: "full", sm: "320px" }}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                        placeholder="ค้นหาชื่อ หรือสถานที่จัดกิจกรรม..."
                        rounded="lg"
                        focusBorderColor="orange.500"
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value)
                            setPageByDate({})
                        }}
                    />
                </InputGroup>

                {isSuperAdmin && (
                    <HStack spacing={2} align="center">
                        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">คณะ:</Text>
                        <Select
                            size="sm"
                            rounded="lg"
                            focusBorderColor="orange.500"
                            value={selectedOwnerFilter}
                            onChange={(e) => handleOwnerFilterChange(e.target.value)}
                            w={{ base: "full", sm: "220px" }}
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
            </Flex>

            {/* Date Tabs & Flat Activity Rows */}
            <Tabs variant="enclosed" colorScheme="orange">
                <TabList mb={2}>
                    {availableDates.map((date) => (
                        <Tab key={date} fontSize="xs" fontWeight="semibold">
                            {date} ({activitiesByDate[date]?.length || 0})
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
                            <TabPanel key={date} px={0} py={2}>
                                {currentActivities.length === 0 ? (
                                    <Box py={10} textAlign="center" color="gray.500">
                                        <Text fontSize="xs">ไม่พบกิจกรรม</Text>
                                    </Box>
                                ) : (
                                    <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid" borderColor={borderColor} />}>
                                        {currentActivities.map((act) => (
                                            <Flex
                                                key={act.id}
                                                py={3}
                                                px={2}
                                                rounded="md"
                                                cursor="pointer"
                                                transition="background 0.15s ease"
                                                _hover={{ bg: hoverBg }}
                                                onClick={() => handleEdit(act.id)}
                                                justify="space-between"
                                                align={{ base: "flex-start", sm: "center" }}
                                                gap={3}
                                            >
                                                <VStack align="flex-start" spacing={1} flex="1">
                                                    <HStack spacing={2} wrap="wrap">
                                                        {!act.display && (
                                                            <Badge colorScheme="red" variant="subtle" fontSize="xs">
                                                                ซ่อน
                                                            </Badge>
                                                        )}
                                                        <Text fontSize="xs" fontWeight="bold" color={textColor}>
                                                            #{act.id} {act.title}
                                                        </Text>
                                                        <Badge
                                                            variant="subtle"
                                                            colorScheme={activityBadgeColorScheme[act.activity_type] || "gray"}
                                                            fontSize="xs"
                                                        >
                                                            {act.activity_type.replace("_", " ")}
                                                        </Badge>
                                                        {act.owner && isSuperAdmin && (
                                                            <Badge colorScheme="orange" variant="outline" fontSize="xs">
                                                                {act.owner.name}
                                                            </Badge>
                                                        )}
                                                    </HStack>

                                                    <HStack spacing={3} fontSize="xs" color="gray.500" wrap="wrap">
                                                        <Text>📍 {act.location}</Text>
                                                        <Text>
                                                            🏫 {act.faculty?.name_th}
                                                            {act.department?.name_th ? ` • ${act.department?.name_th}` : ""}
                                                        </Text>
                                                        <Text>⏰ {act.start_time} - {act.end_time} (รอบ {act.round})</Text>
                                                    </HStack>
                                                </VStack>

                                                <HStack spacing={3} flexShrink={0}>
                                                    {act.activity_type !== "non_regis_activity" && (
                                                        <Text
                                                            fontSize="xs"
                                                            color={act.current_register_participants === act.max_participants ? "red.500" : "green.600"}
                                                            fontWeight="medium"
                                                        >
                                                            {act.current_register_participants} / {act.max_participants} คน
                                                        </Text>
                                                    )}
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
                                        ))}
                                    </VStack>
                                )}

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
        </KMAppLayout>
    )
}

export { KMDashboardPage }