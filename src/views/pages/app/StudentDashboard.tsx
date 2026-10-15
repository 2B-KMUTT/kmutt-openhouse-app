"use client"

import { useEffect, useState } from "react"
import StudentAppLayout from "@/views/layouts/StudentAppLayout"
import {
    Box,
    Flex,
    Heading,
    Text,
    Spinner,
    Badge,
    VStack,
    Input,
    Button,
    HStack,
    useColorModeValue,
    Icon,
    SimpleGrid,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react"
import StudentProfileCard from "@/components/ProfileCard/StudentProfileCard"
import { GrWorkshop } from "react-icons/gr"
import Link from "next/link"
import Head from "next/head"
import MiniContactSection from "../landing/MiniContactSection"
import { FaCameraRetro, FaCertificate, FaClipboardList, FaQrcode } from "react-icons/fa"
import { useRouter } from "next/router"
import { GiJourney } from "react-icons/gi"

const PRIMARY = "#F04E23"

type Activity = {
    id: number
    title: string
    description: string
    date: string
    start_time: string
    end_time: string
    location: string
    max_participants: number
    current_register_participants: number
    point: number
    round: number
    activity_type: string
    faculty: { id: number; name_th: string }
    department: { id: number; name_th: string }
}

type Meta = {
    total: number
    page: number
    limit: number
    totalPages: number
}

type StudentProfile = {
    first_name: string
    last_name: string
    school: string
    province: string
    email: string
    phone: string
    uid: string
}

const StudentDashboardPage = () => {
    const router = useRouter()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState<Meta | null>(null)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const textColor = useColorModeValue("gray.800", "gray.100")

    // ✅ ตรวจสอบว่าทำแบบสอบถามหรือยัง
    useEffect(() => {
        const doneSurvey = localStorage.getItem("doneSurveyXSIT")
        if (!doneSurvey) {
            // ยังไม่ทำ — เด้ง modal ขึ้นหลังโหลด
            setTimeout(onOpen, 1000)
        }
    }, [onOpen])

    // ✅ ดึงข้อมูลโปรไฟล์นักเรียน
    useEffect(() => {
        fetch("/api/student/profile")
            .then((res) => res.json())
            .then((d) => setProfile(d))
    }, [])

    // ✅ ดึงกิจกรรมทั้งหมด
    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/student/activities?page=${page}&search=${search}`)
                const data = await res.json()
                setActivities(data.data)
                setMeta(data.meta)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchActivities()
    }, [page, search])

    if (!profile) {
        return (
            <StudentAppLayout navigation="Dashboard">
                <Flex justify="center" align="center" minH="60vh">
                    <Text>กำลังโหลดข้อมูลนักเรียน...</Text>
                </Flex>
            </StudentAppLayout>
        )
    }

    const dateColors: Record<string, string> = {
        "30/10/2026": "orange",
        "2026-10-30": "orange",
        "30-10-2026": "orange",
        "10/10/2025": "yellow",
        "2025-10-10": "yellow",
        "11/10/2025": "green",
        "2025-10-11": "green",
        "12/10/2025": "blue",
        "2025-10-12": "blue",
    }

    const activityTypeLabel: Record<string, string> = {
        workshop: "Workshop",
        regis_activity: "กิจกรรมที่ต้องลงทะเบียน",
        non_regis_activity: "กิจกรรมทั่วไป",
    }

    // ✅ เมื่อกด “ทำแล้ว” จะไม่เด้งอีก
    const handleDoneSurvey = () => {
        localStorage.setItem("doneSurveyXSIT", "true")
        onClose()
    }

    return (
        <StudentAppLayout navigation="Dashboard">
            <Head>
                <title>Openhouse / Dashboard</title>
            </Head>

            {/* ✅ Popup Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color="orange.500">ทำแบบสอบถามหรือยัง?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontSize="md" mb={3}>
                            เพื่อพัฒนา Openhouse ให้ดียิ่งขึ้น รบกวนช่วยทำแบบสอบถามสั้น ๆ หน่อยนะคะ 😊
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="orange" mr={3} onClick={() => router.push("/survey")}>
                            ไปทำแบบสอบถาม
                        </Button>
                        <Button variant="ghost" onClick={handleDoneSurvey}>
                            ทำแล้ว
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ✅ ส่วนเนื้อหาหลัก */}
            <Box>
                <StudentProfileCard data={profile} />
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5} mt={5}>
                    {/* ปุ่ม 4 ช่อง */}
                    <Box
                        onClick={() => router.push("/app/my-passport")}
                        bgGradient="linear(to-r, orange.400, orange.500)"
                        _hover={{
                            bgGradient: "linear(to-r, orange.500, orange.600)",
                            transform: "scale(1.05)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                        w="100%"
                        h="fit-content"
                        p={6}
                        rounded="2xl"
                        shadow="md"
                        cursor={"pointer"}
                    >
                        <Flex direction="column" align="center" justify="center" textAlign="center">
                            <Icon as={FaQrcode} boxSize={8} color="white" mb={3} />
                            <Text fontWeight="bold" fontSize="lg" color="white" lineHeight="30px">
                                My Passport
                            </Text>
                        </Flex>
                    </Box>

                    <Box
                        onClick={() => router.push("/app/my-journey")}
                        bgGradient="linear(to-r, orange.400, orange.500)"
                        _hover={{
                            bgGradient: "linear(to-r, orange.500, orange.600)",
                            transform: "scale(1.05)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                        w="100%"
                        h="fit-content"
                        p={6}
                        rounded="2xl"
                        shadow="md"
                        cursor={"pointer"}
                    >
                        <Flex direction="column" align="center" justify="center" textAlign="center">
                            <Icon as={GiJourney} boxSize={8} color="white" mb={3} />
                            <Text fontWeight="bold" fontSize="lg" color="white" lineHeight="30px">
                                กิจกรรมที่ฉันเข้าร่วม
                            </Text>
                        </Flex>
                    </Box>

                    <Box
                        onClick={() => router.push("/app/take-picture")}
                        bgGradient="linear(to-r, orange.400, orange.500)"
                        _hover={{
                            bgGradient: "linear(to-r, orange.500, orange.600)",
                            transform: "scale(1.05)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                        w="100%"
                        h="fit-content"
                        p={6}
                        rounded="2xl"
                        shadow="md"
                        cursor={"pointer"}
                    >
                        <Flex direction="column" align="center" justify="center" textAlign="center">
                            <Icon as={FaCameraRetro} boxSize={8} color="white" mb={3} />
                            <Text fontWeight="bold" fontSize="lg" color="white" lineHeight={"30px"}>
                                ถ่ายรูปกิจกรรม
                            </Text>
                        </Flex>
                    </Box>

                    <Box
                        onClick={() => router.push("/survey")}
                        bgGradient="linear(to-r, orange.400, orange.500)"
                        _hover={{
                            bgGradient: "linear(to-r, orange.500, orange.600)",
                            transform: "scale(1.05)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                        w="100%"
                        h="fit-content"
                        p={6}
                        rounded="2xl"
                        shadow="md"
                        cursor={"pointer"}
                    >
                        <Flex direction="column" align="center" justify="center" textAlign="center">
                            <Icon as={FaClipboardList} boxSize={8} color="white" mb={3} />
                            <Text fontWeight="bold" fontSize="lg" color="white" lineHeight={"30px"}>
                                ร่วมทำแบบสอบถาม
                            </Text>
                        </Flex>
                    </Box>


                </SimpleGrid>

                {/* <Box mt={4} onClick={() => router.push("/app/e-certificate")} bgGradient="linear(to-r, green.400, green.500)" _hover={{ bgGradient: "linear(to-r, green.500, green.600)", transform: "scale(1.05)", boxShadow: "lg", }} transition="all 0.2s" w="100%" h="fit-content" p={6} rounded="2xl" shadow="md" cursor={"pointer"} > <Flex direction="column" align="center" justify="center" textAlign="center"> <Icon as={FaCertificate} boxSize={8} color="white" mb={3} /> <Text fontWeight="bold" fontSize="lg" color="white" lineHeight={"30px"}> E-Certificate </Text> </Flex> </Box> */}

                {/* ค้นหา + รายการกิจกรรม */}
                <Flex justify="space-between" align="center" my={4}>
                    <Heading as="h4" size="md" color={textColor}>
                        กิจกรรมทั้งหมด
                    </Heading>
                    <Input
                        placeholder="ค้นหากิจกรรม..."
                        size="sm"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        width="250px"
                    />
                </Flex>

                {/* รายการกิจกรรม */}
                {loading ? (
                    <Flex justify="center" py={10}>
                        <Spinner size="xl" />
                    </Flex>
                ) : activities.length === 0 ? (
                    <Text color="gray.500">ไม่พบกิจกรรม</Text>
                ) : (
                    <VStack spacing={4} align="stretch">
                        {activities.map((act) => (
                            <Link href={`/app/activity/${act.id}`} key={act.id}>
                                <Box
                                    _hover={{ boxShadow: "md", transform: "scale(1.02)", transition: "all 0.2s" }}
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

                                    <HStack spacing={2} mb={1} align="center">
                                        <Badge colorScheme={dateColors[act.date] || "gray"} fontSize="1rem" fontWeight="bold">
                                            วันที่: {act.date} (รอบ {act.round})
                                        </Badge>
                                        <Badge colorScheme="orange" fontSize="1rem" fontWeight="bold">
                                            เวลา: {act.start_time} - {act.end_time}
                                        </Badge>
                                    </HStack>

                                    <Text fontSize="xs" color="gray.500">
                                        สถานที่: {act.location} | {act.faculty?.name_th} - {act.department?.name_th}
                                    </Text>

                                    {act.activity_type === "non_regis_activity" && act.max_participants !== 999 ? (
                                        <Text fontWeight="bold" color="orange.600" fontSize="sm">
                                            จำกัดจำนวนผู้เข้าร่วม: {act.max_participants} คน - ลงทะเบียนหน้างาน
                                        </Text>
                                    ) : (
                                        <HStack mt={1} spacing={1}>
                                            <Text fontSize="sm" fontWeight="bold" color="orange.600">
                                                {act.activity_type === "non_regis_activity" && act.max_participants === 999
                                                    ? "ไม่จำกัดจำนวนผู้เข้าร่วม"
                                                    : "ลงทะเบียนแล้ว:"}
                                            </Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="orange.800">
                                                {act.activity_type === "non_regis_activity" && act.max_participants === 999
                                                    ? ""
                                                    : act.current_register_participants + "/" + act.max_participants + " คน"}
                                            </Text>
                                        </HStack>
                                    )}
                                </Box>
                            </Link>
                        ))}
                    </VStack>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <HStack justify="center" mt={6} spacing={2}>
                        <Button size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} isDisabled={page === 1}>
                            ก่อนหน้า
                        </Button>
                        <Text>
                            หน้า {page} จาก {meta.totalPages}
                        </Text>
                        <Button
                            size="sm"
                            onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                            isDisabled={page === meta.totalPages}
                        >
                            ถัดไป
                        </Button>
                    </HStack>
                )}
            </Box>

            <Box mt={3}>
                <MiniContactSection />
            </Box>
        </StudentAppLayout>
    )
}

export { StudentDashboardPage }
