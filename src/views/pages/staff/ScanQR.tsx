"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import {
    Box,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
    Spinner,
    Button,
    Alert,
    AlertIcon,
    VStack,
    HStack,
    Divider,
    Badge,
    Flex,
    Icon,
    Center,
    useToast,
} from "@chakra-ui/react"
import { QrCode, RefreshCw, XCircle } from "lucide-react"
import QrReader from "react-qr-reader"
import StaffAppLayout from "@/views/layouts/StaffAppLayout"
import axios from "axios"

import {

    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,

} from "@chakra-ui/react"

type ScanLog = {
    id: number
    student: {
        first_name: string
        last_name: string
        email: string
        school: string
        uuid: string
    }
    issued_at: string
}

const ScanQRPage = () => {
    const router = useRouter()
    const { id: activityId } = router.query
    const toast = useToast()

    const cardBg = useColorModeValue("white", "gray.800")
    const cardBorder = useColorModeValue("gray.200", "gray.700")
    const tableHeaderBg = useColorModeValue("gray.50", "gray.800")
    const stampedBg = useColorModeValue("green.50", "green.900")
    const defaultCardBg = useColorModeValue("gray.50", "gray.800")
    const rowHoverBg = useColorModeValue("gray.50", "whiteAlpha.50")

    const [scanning, setScanning] = useState(false)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null)
    const [logs, setLogs] = useState<ScanLog[]>([])
    const [activeTab, setActiveTab] = useState(0)

    // Type สำหรับ student
    type Student = {
        id: number
        first_name: string
        last_name: string
        email: string
        phone?: string
    }

    // Type สำหรับแต่ละ registration
    type RegisterActivity = {
        id: number
        studentId: number
        activityId: number
        registered_at: string
        student: Student
        stamped: boolean // เพิ่ม field stamped
    }

    // Type สำหรับ activity
    type Activity = {
        id: number
        title: string
        location?: string
        start_time?: string
        end_time?: string
        description?: string
        RegisterActivities: RegisterActivity[]
    }

    // ตัวอย่าง state
    const [activity, setActivity] = useState<Activity | null>(null)



    // const [activity, setActivity] = useState<ActivityState | null>(null)

    const scanLock = useRef(false) // ✅ ป้องกันยิงซ้ำ

    useEffect(() => {
        if (activityId) {
            fetchActivity()
            fetchLogs()
        }
    }, [activityId])

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`/api/staff/estamp/logs?activityId=${activityId}`)
            setLogs(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchActivity = async () => {
        if (!activityId) return
        try {
            const res = await axios.get(`/api/staff/activities/${activityId}`)
            setActivity(res.data)
        } catch (err) {
            console.error("Error fetching activity:", err)
        }
    }

    const handleError = (err: unknown) => {
        console.error("QR Scanner Error:", err)
        setStatus({ type: "error", msg: "ไม่สามารถเปิดกล้องได้" })
    }

    const handleScan = async (data: string | null) => {
        if (!data || !activityId || scanLock.current) return

        scanLock.current = true // 🔒 ป้องกันยิงซ้ำ
        setLoading(true)
        setStatus(null)

        try {
            const res = await axios.post("/api/staff/estamp/scan", { uuid: data, activityId })
            setStatus({ type: "success", msg: res.data.message })

            toast({
                title: "สแกนสำเร็จ",
                description: res.data.message,
                status: "success",
                duration: 2500,
                isClosable: true,
            })

            await fetchLogs()
            // setScanning(false) // 🟡 ถ้าอยากให้สแกนครั้งเดียวแล้วปิดกล้อง เปิดบรรทัดนี้
        } catch (err: unknown) {
            const message =
                (typeof err === "object" &&
                    err !== null &&
                    "response" in err &&
                    (err as { response?: { data?: { message?: string } } }).response?.data?.message) ||
                (err instanceof Error ? err.message : "สแกนไม่สำเร็จ")

            setStatus({ type: "error", msg: message })
            toast({
                title: "เกิดข้อผิดพลาด",
                description: message,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
            setTimeout(() => {
                scanLock.current = false // 🔓 ปลดล็อกหลัง 2 วิ
            }, 2000)
        }
    }

    const handleCancelStamp = async (stampId: number) => {
        if (!confirm("คุณต้องการยกเลิกการสแกนนี้ใช่หรือไม่?")) return
        try {
            await axios.delete(`/api/staff/estamp/${stampId}`)
            setStatus({ type: "info", msg: "ยกเลิกการสแกนสำเร็จ" })
            await fetchLogs()
        } catch {
            setStatus({ type: "error", msg: "ไม่สามารถยกเลิกการสแกนได้" })
        }
    }

    return (
        <StaffAppLayout navigation="Scan">
            <Tabs index={activeTab} onChange={(i) => setActiveTab(i)} variant="enclosed-colored" colorScheme="orange">
                <TabList>
                    <Tab fontSize={{ base: "sm", md: "md" }} fontWeight="bold">รายละเอียด</Tab>
                    <Tab fontSize={{ base: "sm", md: "md" }} fontWeight="bold">สแกน</Tab>
                    <Tab fontSize={{ base: "sm", md: "md" }} fontWeight="bold">ประวัติ</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        {activity && (
                            <Box>
                                <Box
                                    bg="orange.50"
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="orange.200"
                                    p={4}
                                    mb={6}
                                    w="100%"
                                    // maxW="lg"
                                    textAlign="left"
                                >
                                    <Text fontSize="xl" fontWeight="bold" color="orange.700" mb={2}>
                                        {activity.title}
                                    </Text>
                                    {activity.location && (
                                        <Text color="gray.700" mb={1}>
                                            📍 {activity.location}
                                        </Text>
                                    )}
                                    {(activity.start_time || activity.end_time) && (
                                        <Text color="gray.600" mb={1}>
                                            {activity.start_time && `🕒 เริ่ม ${activity.start_time} `}
                                            {activity.end_time && `- สิ้นสุด ${activity.end_time}`}
                                        </Text>
                                    )}
                                    {activity.description && (
                                        <Text color="gray.600" mt={2}>
                                            {activity.description}
                                        </Text>
                                    )}
                                </Box>
                                <Box>
                                    <Button colorScheme="orange" w={"full"} onClick={(() => { setActiveTab(1) })}>เริ่มสแกน</Button>
                                </Box>
                                <Box mt={5}>
                                    <Box mt={5}>
                                        {activity?.RegisterActivities?.length ? (
                                            <>
                                                {/* Mobile Card List */}
                                                <VStack spacing={3} align="stretch" display={{ base: "flex", md: "none" }}>
                                                    {activity.RegisterActivities.map((r, index) => (
                                                        <Box
                                                            key={r.id}
                                                            p={3.5}
                                                            border="1px solid"
                                                            borderColor={cardBorder}
                                                            rounded="xl"
                                                            bg={r.stamped ? stampedBg : defaultCardBg}
                                                            shadow="sm"
                                                        >
                                                            <Flex justify="space-between" align="center" mb={1.5}>
                                                                <Text fontWeight="semibold" fontSize="sm">
                                                                    #{index + 1} {r.student.first_name} {r.student.last_name}
                                                                </Text>
                                                                <Badge colorScheme={r.stamped ? "green" : "gray"} fontSize="2xs">
                                                                    {r.stamped ? "ประทับตราแล้ว" : "ยังไม่ประทับตรา"}
                                                                </Badge>
                                                            </Flex>
                                                            <VStack align="stretch" spacing={0.5} fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                                                                <Text wordBreak="break-all">📧 {r.student.email}</Text>
                                                                <Text>📞 {r.student.phone || "-"}</Text>
                                                                <Text color="gray.500">
                                                                    🕒 {new Date(r.registered_at).toLocaleString("th-TH")}
                                                                </Text>
                                                            </VStack>
                                                        </Box>
                                                    ))}
                                                </VStack>

                                                {/* Desktop Table */}
                                                <Box
                                                    display={{ base: "none", md: "block" }}
                                                    border="1px solid"
                                                    borderColor={cardBorder}
                                                    rounded="xl"
                                                    overflow="hidden"
                                                    shadow="sm"
                                                >
                                                    <TableContainer overflowX="auto">
                                                        <Table variant="simple" size="sm">
                                                            <Thead bg={tableHeaderBg}>
                                                                <Tr>
                                                                    <Th width="60px" textAlign="center" py={3}>ลำดับ</Th>
                                                                    <Th minW="150px" py={3}>ชื่อ-นามสกุล</Th>
                                                                    <Th minW="180px" py={3}>Email</Th>
                                                                    <Th width="120px" py={3}>Phone</Th>
                                                                    <Th width="160px" py={3}>วันที่ลงทะเบียน</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {activity.RegisterActivities.map((r, index) => (
                                                                    <Tr
                                                                        key={r.id}
                                                                        bg={r.stamped ? stampedBg : undefined}
                                                                        _hover={{ bg: rowHoverBg }}
                                                                    >
                                                                        <Td textAlign="center" py={3}>{index + 1}</Td>
                                                                        <Td fontWeight="medium" py={3}>{r.student.first_name} {r.student.last_name}</Td>
                                                                        <Td py={3}>{r.student.email}</Td>
                                                                        <Td py={3}>{r.student.phone || "-"}</Td>
                                                                        <Td color="gray.500" py={3} whiteSpace="nowrap">
                                                                            {new Date(r.registered_at).toLocaleString("th-TH")}
                                                                        </Td>
                                                                    </Tr>
                                                                ))}
                                                            </Tbody>
                                                        </Table>
                                                    </TableContainer>
                                                </Box>
                                            </>
                                        ) : (
                                            <Box py={8} textAlign="center" color="gray.500" border="1px dashed" borderColor={cardBorder} rounded="xl">
                                                <Text fontSize="sm">ไม่มีผู้ลงทะเบียนไว้ก่อนหน้า</Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>


                            </Box>
                        )}
                    </TabPanel>
                    {/* ---------- TAB 1 : SCAN ---------- */}
                    <TabPanel>

                        <Box p={0} bg={cardBg} borderRadius="2xl" >


                            <Center flexDir="column">
                                <Icon as={QrCode} boxSize={16} display={{ base: "none", md: "block" }} color="orange.500" mb={4} />
                                <Text fontSize={{ base: "lg", md: "2xl" }} display={{ base: "none", md: "block" }}>
                                    สแกน QR Code นักเรียน
                                </Text>

                                {!scanning ? (
                                    <Button mt={5} colorScheme="orange" size="lg" borderRadius="full" onClick={() => setScanning(true)}>
                                        เปิดกล้อง
                                    </Button>
                                ) : (
                                    <Box textAlign="center">
                                        <Box
                                            position="relative"
                                            overflow="hidden"
                                            borderRadius="2xl"
                                            border="4px solid"
                                            borderColor="orange.400"
                                            mx="auto"
                                            width={{ base: "200px", md: "300px" }}
                                            aspectRatio="1"
                                            shadow="2xl"
                                            mt={5}
                                            bg="black"
                                        >
                                            <QrReader
                                                delay={300}
                                                onError={handleError}
                                                onScan={handleScan}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />

                                            {/* ✅ crosshair */}
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="50%"
                                                transform="translate(-50%, -50%)"
                                                width="60%"
                                                height="60%"
                                                border="2px solid white"
                                                borderRadius="md"
                                                opacity={0.7}
                                                pointerEvents="none"
                                            />
                                        </Box>

                                        <Button
                                            mt={8}
                                            size={{ base: "sm", md: "lg" }}
                                            colorScheme="gray"
                                            variant="outline"
                                            borderRadius="full"
                                            px={8}
                                            onClick={() => setScanning(false)}
                                        >
                                            หยุดสแกน
                                        </Button>
                                    </Box>
                                )}

                                {loading && (
                                    <Box mt={4}>
                                        <Spinner color="orange.500" /> <Text mt={2}>กำลังบันทึก...</Text>
                                    </Box>
                                )}

                                {status && (
                                    <Alert status={status.type} mt={4} borderRadius="lg" variant="left-accent">
                                        <AlertIcon />
                                        {status.msg}
                                    </Alert>
                                )}
                            </Center>

                            <Divider my={8} />

                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>
                                    ประวัติการสแกนล่าสุด
                                </Text>
                                <VStack align="stretch" spacing={3}>
                                    {logs.length === 0 ? (
                                        <Text color="gray.500">ยังไม่มีการสแกน</Text>
                                    ) : (
                                        logs.slice(0, 5).map((log) => (
                                            <HStack
                                                key={log.id}
                                                p={4}
                                                bg={cardBg}
                                                borderRadius="lg"
                                                justify="space-between"
                                                _hover={{ shadow: "sm", bg: cardBg }}
                                            >
                                                <Box>
                                                    <Text fontWeight="semibold">
                                                        {log.student.first_name} {log.student.last_name}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {log.student.school}
                                                    </Text>
                                                </Box>
                                                <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                                                    Stamped
                                                </Badge>
                                            </HStack>
                                        ))
                                    )}
                                </VStack>
                            </Box>
                        </Box>
                    </TabPanel>

                    {/* ---------- TAB 2 : LOGS ---------- */}
                    <TabPanel>
                        <Box bg={cardBg} p={0} borderRadius="2xl" >
                            <Flex justify="space-between" align="center" mb={6}>
                                <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold">
                                    Logs ทั้งหมด
                                </Text>
                                <Button
                                    size="sm"
                                    leftIcon={<RefreshCw size={16} />}
                                    onClick={fetchLogs}
                                    colorScheme="orange"
                                    variant="ghost"
                                >
                                    รีเฟรช
                                </Button>
                            </Flex>

                            {logs.length === 0 ? (
                                <Text color="gray.500">ยังไม่มีข้อมูล</Text>
                            ) : (
                                <VStack align="stretch" spacing={4}>
                                    {logs.map((log) => (
                                        <Box
                                            key={log.id}
                                            p={4}
                                            borderRadius="lg"
                                            border="1px solid"
                                            borderColor={cardBorder}
                                            bg={cardBg}
                                            _hover={{ shadow: "sm", bg: cardBg }}
                                        >
                                            <Flex justify="space-between" align="center">
                                                <Box>
                                                    <Text fontSize={"md"} fontWeight="medium">
                                                        {log.student.first_name} {log.student.last_name}
                                                    </Text>
                                                    <Text color="gray.500">
                                                        {log.student.school}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.400" mt={1}>
                                                        {new Date(log.issued_at).toLocaleString("th-TH")}
                                                    </Text>
                                                </Box>
                                                <Button
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<XCircle size={14} />}
                                                    onClick={() => handleCancelStamp(log.id)}
                                                >
                                                    ยกเลิก
                                                </Button>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </StaffAppLayout >
    )
}

export { ScanQRPage as ScanQR }
