"use client"

import { useEffect, useState } from "react"
import StudentAppLayout from "@/views/layouts/StudentAppLayout"
import {
    Box,
    Flex,
    Text,
    Spinner,
    VStack,
    HStack,
    Input,
    Button,
    Badge,
    Checkbox,
    CheckboxGroup,
    Stack,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/react"
import { GrWorkshop } from "react-icons/gr"
import Link from "next/link"
import Head from "next/head"

interface Activity {
    id: number
    title: string
    description: string
    date: string
    start_time: string
    end_time: string
    location: string
    point: number
    max_participants: number
    current_register_participants: number
    stars: number
    form_link?: string
    activity_type: string
    round: number
    created_at: string
    department: { id: number; name_th: string; name_en: string }
    faculty: { id: number; name_th: string; name_en: string }
}

interface Department {
    id: number
    name_th: string
    name_en: string
}

const SearchActivityPage = () => {
    const [activities, setActivities] = useState<Activity[]>([]) // ✅ แก้เป็น array ว่าง
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>([])
    const [selectedDates, setSelectedDates] = useState<string[]>([])
    const [searchText, setSearchText] = useState("")
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 10

    const bgColor = useColorModeValue("white", "gray.700")
    const textColor = useColorModeValue("gray.700", "gray.400")

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/student/departments")
            const data = await res.json()
            setDepartments(data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchActivities = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append("page", page.toString())
            params.append("limit", limit.toString())
            if (searchText) params.append("search", searchText)
            if (selectedDepartments.length > 0) params.append("departments", selectedDepartments.join(","))
            if (selectedDates.length > 0) params.append("dates", selectedDates.join(","))

            const res = await fetch(`/api/student/activities/search?${params.toString()}`)
            const data = await res.json()
            setActivities(data.data)
            setTotalPages(data.meta.totalPages)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    useEffect(() => {
        fetchActivities()
    }, [page, selectedDepartments, selectedDates, searchText])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
        setPage(1)
    }


    const handleDeptSelect = (id: number, checked: boolean) => {
        if (checked) {
            // เพิ่ม id ถ้ายังไม่มี
            setSelectedDepartments((prev) => [...prev, id]);
        } else {
            // ลบ id ถ้า uncheck
            setSelectedDepartments((prev) => prev.filter((deptId) => deptId !== id));
        }
    };

    const handleDateChange = (values: string[]) => {
        setSelectedDates(values)
        setPage(1)
    }

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
        <StudentAppLayout navigation="ค้นหากิจกรรม">
            <Head>
                <title>Openhouse / Activity search</title>
            </Head>
            <Box maxW="full" mx="auto" p={0}>
                {/* Search */}
                <Input
                    placeholder="ค้นหาชื่อกิจกรรม"
                    mb={4}
                    value={searchText}
                    onChange={handleSearchChange}
                    bg={bgColor}
                />

                <Menu closeOnSelect={false}>
                    <MenuButton as={Button}>
                        เลือก คณะ/ภาควิชา/หน่วยงาน ({selectedDepartments.length})
                    </MenuButton>
                    <MenuList maxH="200px" overflowY="auto">
                        {departments.map((d) => (
                            <MenuItem key={d.id}>
                                <Checkbox
                                    isChecked={selectedDepartments.includes(d.id)}
                                    onChange={(e) => handleDeptSelect(d.id, e.target.checked)}
                                >
                                    {d.name_th}
                                </Checkbox>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>

                {/* Date Filter */}
                <Box mb={4}>
                    <Text fontWeight="bold" mb={2} mt={2}>เลือกวัน:</Text>
                    <CheckboxGroup value={selectedDates} onChange={handleDateChange}>
                        <Stack direction="row" wrap="wrap">
                            {["30/10/2026"].map((d) => (
                                <Checkbox key={d} value={d}>30 ตุลาคม 2569 ({d})</Checkbox>
                            ))}
                        </Stack>
                    </CheckboxGroup>
                </Box>

                {/* Activities List */}
                {loading ? (
                    <Flex justify="center" align="center" minH="40vh">
                        <Spinner size="xl" />
                    </Flex>
                ) : activities?.length === 0 ? (
                    <Text>ไม่พบกิจกรรม</Text>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {activities.map((act) => (

                            <Link href={`/app/activity/${act.id}`} key={act.id}>
                                <Box
                                    key={act.id}
                                    p={4}
                                    bg="white"
                                    _dark={{ bg: "gray.700" }}
                                    rounded="xl"
                                    shadow="sm"
                                >
                                    <HStack justify="space-between" mb={2}>
                                        <Flex align="center" gap={2}>
                                            <GrWorkshop />

                                            <Text fontSize="md" noOfLines={2} fontWeight="bold">
                                                {act.title}
                                            </Text>

                                        </Flex>

                                        <Badge
                                            colorScheme={
                                                act.activity_type === "workshop"
                                                    ? "blue"
                                                    : act.activity_type === "regis_activity"
                                                        ? "green"
                                                        : act.activity_type === "non_regis_activity"
                                                            ? "orange"
                                                            : "gray"
                                            }
                                            textTransform="capitalize"
                                            fontSize="1rem"
                                        >
                                            {activityTypeLabel[act.activity_type] || "ไม่ระบุ"}
                                        </Badge>
                                    </HStack>

                                    <Text noOfLines={3} fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mb={2}>
                                        {act.description}
                                    </Text>

                                    {/* วันที่ & เวลา */}
                                    <HStack spacing={2} mb={1} align="center">

                                        <Badge colorScheme={dateColors[act.date] || "gray"} fontSize="1rem" fontWeight="bold">
                                            วันที่: {act.date} (รอบ {act.round})
                                        </Badge>
                                        <Badge colorScheme="orange" fontSize="1rem" fontWeight="bold">
                                            เวลา: {act.start_time} - {act.end_time}
                                        </Badge>
                                    </HStack>

                                    <Text fontSize="xs" color="gray.500">
                                        สถานที่: {act.location} | {act.faculty?.name_th} - {" "}
                                        {act.department?.name_th}
                                    </Text>
                                    {act.activity_type === "non_regis_activity" && act.max_participants !== 999 ? (<Text fontWeight="bold" color="orange.600" fontSize="sm" >จำกัดจำนวนผู้เข้าร่วม: {act.max_participants} คน - ลงทะเบียนหน้างาน</Text>) :
                                        <HStack mt={1} spacing={1}>
                                            <Text fontSize="sm" fontWeight="bold" color="orange.600">
                                                {act.activity_type === "non_regis_activity" && act.max_participants === 999 ? "ไม่จำกัดจำนวนผู้เข้าร่วม" : "ลงทะเบียนแล้ว:"}
                                            </Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="orange.800">
                                                {act.activity_type === "non_regis_activity" && act.max_participants === 999
                                                    ? ""
                                                    : act.current_register_participants + "/" + act.max_participants + " คน"}
                                            </Text>
                                        </HStack>
                                    }


                                </Box>
                            </Link>
                        ))}
                    </VStack>
                )}

                {/* Pagination */}
                <HStack justify="center" mt={4} spacing={2}>
                    <Button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        isDisabled={page === 1}
                    >
                        ก่อนหน้า
                    </Button>
                    <Text>{page} / {totalPages}</Text>
                    <Button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        isDisabled={page === totalPages}
                    >
                        ถัดไป
                    </Button>
                </HStack>
            </Box>
        </StudentAppLayout>
    )
}

export { SearchActivityPage }
