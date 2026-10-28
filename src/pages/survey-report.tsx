"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Box,
    Heading,
    VStack,
    HStack,
    Spinner,
    Center,
    Text,
    SimpleGrid,
    useColorModeValue,
    Button,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Card,
    CardHeader,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Flex,
    Divider,
} from "@chakra-ui/react"
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts"
import Head from "next/head"
import * as XLSX from "xlsx"
import { Download, RefreshCw, Users, ThumbsUp, HeartHandshake, School } from "lucide-react"

type SurveyRecord = {
    id: number
    role: string
    province: string
    sourceChannels: string[] | string | null
    grade?: string | null
    stream?: string | null
    interestedFaculty?: string[] | string | null
    decisionFactors?: string[] | string | null
    worryPoints?: string | null
    parentGrade?: string | null
    parentWorries?: string[] | string | null
    parentInfoNeeded?: string | null
    parentContactChannel?: string | null
    teacherNeeds?: string[] | string | null
    teacherCreditTransferInterest?: number | null
    teacherSchoolContact?: string | null
    recommendIntent?: number | null
    overallSatisfaction?: number | null
    feedbackNote?: string | null
    createdAt: string
}

const COLORS = [
    "#FF8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF4560",
    "#775DD0",
    "#00E396",
    "#FEB019",
    "#D10CE8",
    "#4ECDC4",
]

const parseArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val)
            if (Array.isArray(parsed)) return parsed
        } catch {
            return val.split(",").map((s) => s.trim()).filter(Boolean)
        }
    }
    return []
}

const sortDesc = (data: { name: string; value: number }[]) =>
    [...data].sort((a, b) => b.value - a.value)

export default function SurveyReportPage() {
    const [surveys, setSurveys] = useState<SurveyRecord[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const cardBg = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.700")
    const pageBg = useColorModeValue("gray.50", "gray.900")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const mutedColor = useColorModeValue("gray.500", "gray.400")

    const fetchSurveys = () => {
        setLoading(true)
        setErrorMsg(null)
        fetch("/api/survey")
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.error || `Error ${res.status}`)
                }
                return res.json()
            })
            .then((data) => {
                setSurveys(data.surveys || [])
                setLoading(false)
            })
            .catch((err: Error) => {
                setErrorMsg(err.message)
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchSurveys()
    }, [])

    // Summary calculations
    const totalCount = surveys.length

    const countByField = (field: keyof SurveyRecord, isArray = false) => {
        const map: Record<string, number> = {}
        surveys.forEach((s) => {
            const val = s[field]
            if (isArray) {
                const list = parseArray(val)
                list.forEach((item) => {
                    const k = item.trim()
                    if (k) map[k] = (map[k] || 0) + 1
                })
            } else if (typeof val === "string" && val.trim()) {
                const k = val.trim()
                map[k] = (map[k] || 0) + 1
            }
        })
        return Object.entries(map).map(([name, value]) => ({ name, value }))
    }

    const countRatings = (field: "recommendIntent" | "overallSatisfaction") => {
        const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        surveys.forEach((s) => {
            const v = s[field]
            if (v && v >= 1 && v <= 5) {
                counts[v] = (counts[v] || 0) + 1
            }
        })
        return [1, 2, 3, 4, 5].map((num) => ({
            name: `${num} คะแนน`,
            value: counts[num],
        }))
    }

    // Role breakdown
    const roleData = useMemo(() => sortDesc(countByField("role")), [surveys])
    const provinceData = useMemo(() => sortDesc(countByField("province")), [surveys])
    const sourceData = useMemo(() => sortDesc(countByField("sourceChannels", true)), [surveys])

    // Student segment
    const studentSurveys = useMemo(
        () => surveys.filter((s) => s.role === "นักเรียน"),
        [surveys]
    )
    const studentGradeData = useMemo(() => {
        const map: Record<string, number> = {}
        studentSurveys.forEach((s) => {
            if (s.grade) map[s.grade] = (map[s.grade] || 0) + 1
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [studentSurveys])

    const studentStreamData = useMemo(() => {
        const map: Record<string, number> = {}
        studentSurveys.forEach((s) => {
            if (s.stream) map[s.stream] = (map[s.stream] || 0) + 1
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [studentSurveys])

    const studentFacultyData = useMemo(() => {
        const map: Record<string, number> = {}
        studentSurveys.forEach((s) => {
            const faculties = parseArray(s.interestedFaculty)
            faculties.forEach((f) => {
                if (f) map[f] = (map[f] || 0) + 1
            })
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [studentSurveys])

    const studentFactorData = useMemo(() => {
        const map: Record<string, number> = {}
        studentSurveys.forEach((s) => {
            const factors = parseArray(s.decisionFactors)
            factors.forEach((f) => {
                if (f) map[f] = (map[f] || 0) + 1
            })
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [studentSurveys])

    const studentWorryData = useMemo(() => {
        const map: Record<string, number> = {}
        studentSurveys.forEach((s) => {
            if (s.worryPoints) map[s.worryPoints] = (map[s.worryPoints] || 0) + 1
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [studentSurveys])

    // Parent segment
    const parentSurveys = useMemo(
        () => surveys.filter((s) => s.role === "ผู้ปกครอง"),
        [surveys]
    )
    const parentWorryData = useMemo(() => {
        const map: Record<string, number> = {}
        parentSurveys.forEach((s) => {
            const worries = parseArray(s.parentWorries)
            worries.forEach((w) => {
                if (w) map[w] = (map[w] || 0) + 1
            })
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [parentSurveys])

    const parentInfoData = useMemo(() => {
        const map: Record<string, number> = {}
        parentSurveys.forEach((s) => {
            if (s.parentInfoNeeded) map[s.parentInfoNeeded] = (map[s.parentInfoNeeded] || 0) + 1
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [parentSurveys])

    const parentChannelData = useMemo(() => {
        const map: Record<string, number> = {}
        parentSurveys.forEach((s) => {
            if (s.parentContactChannel)
                map[s.parentContactChannel] = (map[s.parentContactChannel] || 0) + 1
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [parentSurveys])

    // Teacher segment
    const teacherSurveys = useMemo(
        () => surveys.filter((s) => s.role === "ครู / ครูแนะแนว"),
        [surveys]
    )
    const teacherNeedsData = useMemo(() => {
        const map: Record<string, number> = {}
        teacherSurveys.forEach((s) => {
            const needs = parseArray(s.teacherNeeds)
            needs.forEach((n) => {
                if (n) map[n] = (map[n] || 0) + 1
            })
        })
        return sortDesc(Object.entries(map).map(([name, value]) => ({ name, value })))
    }, [teacherSurveys])

    const avgTeacherCreditInterest = useMemo(() => {
        const ratings = teacherSurveys
            .map((s) => s.teacherCreditTransferInterest)
            .filter((v): v is number => typeof v === "number" && v > 0)
        if (ratings.length === 0) return 0
        return ratings.reduce((sum, v) => sum + v, 0) / ratings.length
    }, [teacherSurveys])

    const teacherContacts = useMemo(
        () =>
            teacherSurveys
                .filter((s) => s.teacherSchoolContact && s.teacherSchoolContact.trim())
                .map((s) => ({
                    province: s.province,
                    contact: s.teacherSchoolContact as string,
                    createdAt: s.createdAt,
                })),
        [teacherSurveys]
    )

    // Key KPIs
    const avgIntent = useMemo(() => {
        const valid = surveys
            .map((s) => s.recommendIntent)
            .filter((v): v is number => typeof v === "number" && v > 0)
        if (valid.length === 0) return 0
        return valid.reduce((sum, v) => sum + v, 0) / valid.length
    }, [surveys])

    const avgSatisfaction = useMemo(() => {
        const valid = surveys
            .map((s) => s.overallSatisfaction)
            .filter((v): v is number => typeof v === "number" && v > 0)
        if (valid.length === 0) return 0
        return valid.reduce((sum, v) => sum + v, 0) / valid.length
    }, [surveys])

    const intentData = useMemo(() => countRatings("recommendIntent"), [surveys])
    const satData = useMemo(() => countRatings("overallSatisfaction"), [surveys])

    const feedbackNotes = useMemo(
        () =>
            surveys
                .filter((s) => s.feedbackNote && s.feedbackNote.trim())
                .map((s) => ({
                    role: s.role,
                    province: s.province,
                    note: s.feedbackNote as string,
                    createdAt: s.createdAt,
                })),
        [surveys]
    )

    // Export to Excel
    const handleExportExcel = () => {
        if (!surveys.length) return

        const exportData = surveys.map((s, idx) => ({
            ลำดับ: idx + 1,
            บทบาท: s.role,
            จังหวัด: s.province,
            ช่องทางที่รู้จัก: parseArray(s.sourceChannels).join(", "),
            ระดับชั้น_นักเรียน: s.grade || "-",
            แผนการเรียน: s.stream || "-",
            คณะที่สนใจ: parseArray(s.interestedFaculty).join(", ") || "-",
            ปัจจัยเลือกมหาวิทยาลัย: parseArray(s.decisionFactors).join(", ") || "-",
            ความกังวลนักเรียน: s.worryPoints || "-",
            ระดับชั้นบุตรหลาน_ผู้ปกครอง: s.parentGrade || "-",
            ความกังวลผู้ปกครอง: parseArray(s.parentWorries).join(", ") || "-",
            ข้อมูลที่ต้องการเพิ่ม: s.parentInfoNeeded || "-",
            ช่องทางรับข่าวผู้ปกครอง: s.parentContactChannel || "-",
            สิ่งที่ครูต้องการสนับสนุน: parseArray(s.teacherNeeds).join(", ") || "-",
            ความสนใจเทียบโอน_ครู: s.teacherCreditTransferInterest ?? "-",
            ข้อมูลติดต่อโรงเรียน_ครู: s.teacherSchoolContact || "-",
            ความอยากสมัครแนะนำมจธ_1ถึง5: s.recommendIntent ?? "-",
            ความพึงพอใจต่องาน_1ถึง5: s.overallSatisfaction ?? "-",
            ข้อเสนอแนะเพิ่มเติม: s.feedbackNote || "-",
            วันที่ตอบ: new Date(s.createdAt).toLocaleString("th-TH"),
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses")
        XLSX.writeFile(
            workbook,
            `KMUTT_RoiEt_Survey_${new Date().toISOString().slice(0, 10)}.xlsx`
        )
    }

    if (loading) {
        return (
            <Center minH="100vh" bg={pageBg}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="orange.500" thickness="4px" />
                    <Text color={mutedColor} fontSize="md">
                        กำลังโหลดข้อมูลรายงานสรุปผล...
                    </Text>
                </VStack>
            </Center>
        )
    }

    if (errorMsg) {
        return (
            <Center minH="100vh" bg={pageBg} px={4}>
                <Card maxW="500px" p={6} rounded="xl" shadow="md" textAlign="center">
                    <Heading size="md" color="red.500" mb={3}>
                        ไม่สามารถโหลดรายงานได้
                    </Heading>
                    <Text color={mutedColor} mb={5}>
                        {errorMsg}
                    </Text>
                    <Button colorScheme="orange" onClick={fetchSurveys}>
                        ลองใหม่อีกครั้ง
                    </Button>
                </Card>
            </Center>
        )
    }

    return (
        <Box py={{ base: 6, md: 10 }} px={{ base: 4, md: 8 }} bg={pageBg} minH="100vh">
            <Head>
                <title>รายงานสรุปผลแบบสอบถาม เปิดเฮือน มจธ. (ร้อยเอ็ด)</title>
            </Head>

            <Box maxW="1280px" mx="auto">
                {/* Header */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={4}
                    mb={8}
                >
                    <Box>
                        <Badge colorScheme="orange" px={3} py={1} rounded="md" mb={2}>
                            KMUTT Open House · ร้อยเอ็ด
                        </Badge>
                        <Heading fontSize={{ base: "2xl", md: "3xl" }} color="orange.600">
                            รายงานสรุปผลแบบสอบถาม
                        </Heading>
                        <Text color={mutedColor} fontSize="sm">
                            อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")} · จำนวนผู้ตอบทั้งหมด{" "}
                            {totalCount} คน
                        </Text>
                    </Box>

                    <HStack spacing={3}>
                        <Button
                            leftIcon={<RefreshCw size={16} />}
                            variant="outline"
                            colorScheme="orange"
                            size="sm"
                            rounded="lg"
                            onClick={fetchSurveys}
                        >
                            รีเฟรช
                        </Button>
                        <Button
                            leftIcon={<Download size={16} />}
                            colorScheme="orange"
                            size="sm"
                            rounded="lg"
                            onClick={handleExportExcel}
                            isDisabled={totalCount === 0}
                        >
                            ส่งออก Excel (.xlsx)
                        </Button>
                    </HStack>
                </Flex>

                {totalCount === 0 ? (
                    <Card p={10} rounded="2xl" textAlign="center">
                        <Text fontSize="lg" color={mutedColor}>
                            ยังไม่มีข้อมูลผู้ตอบแบบสอบถามในระบบ
                        </Text>
                    </Card>
                ) : (
                    <VStack spacing={8} align="stretch">
                        {/* Summary KPI Cards */}
                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <Stat>
                                    <Flex align="center" gap={2} mb={1}>
                                        <Users size={18} color="#F04E23" />
                                        <StatLabel color={mutedColor} fontSize="sm">
                                            ผู้ตอบแบบสอบถามทั้งหมด
                                        </StatLabel>
                                    </Flex>
                                    <StatNumber fontSize="3xl" color="orange.500" fontWeight="bold">
                                        {totalCount}
                                    </StatNumber>
                                    <StatHelpText mb={0}>คน</StatHelpText>
                                </Stat>
                            </Card>

                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <Stat>
                                    <Flex align="center" gap={2} mb={1}>
                                        <HeartHandshake size={18} color="#0088FE" />
                                        <StatLabel color={mutedColor} fontSize="sm">
                                            ความอยากสมัคร / แนะนำ มจธ.
                                        </StatLabel>
                                    </Flex>
                                    <StatNumber fontSize="3xl" color="blue.500" fontWeight="bold">
                                        {avgIntent.toFixed(2)}
                                    </StatNumber>
                                    <StatHelpText mb={0}>จากเต็ม 5.00 คะแนน</StatHelpText>
                                </Stat>
                            </Card>

                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <Stat>
                                    <Flex align="center" gap={2} mb={1}>
                                        <ThumbsUp size={18} color="#00C49F" />
                                        <StatLabel color={mutedColor} fontSize="sm">
                                            ความพึงพอใจต่องาน
                                        </StatLabel>
                                    </Flex>
                                    <StatNumber fontSize="3xl" color="teal.500" fontWeight="bold">
                                        {avgSatisfaction.toFixed(2)}
                                    </StatNumber>
                                    <StatHelpText mb={0}>จากเต็ม 5.00 คะแนน</StatHelpText>
                                </Stat>
                            </Card>

                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <Stat>
                                    <Flex align="center" gap={2} mb={1}>
                                        <School size={18} color="#775DD0" />
                                        <StatLabel color={mutedColor} fontSize="sm">
                                            ความสนใจเทียบโอน (ครู)
                                        </StatLabel>
                                    </Flex>
                                    <StatNumber fontSize="3xl" color="purple.500" fontWeight="bold">
                                        {avgTeacherCreditInterest.toFixed(2)}
                                    </StatNumber>
                                    <StatHelpText mb={0}>จากครู {teacherSurveys.length} ท่าน</StatHelpText>
                                </Stat>
                            </Card>
                        </SimpleGrid>

                        {/* Overview Graphs: Role & Province & Source */}
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            {/* Role Breakdown */}
                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <CardHeader p={0} mb={4}>
                                    <Heading size="sm">สัดส่วนผู้เข้าร่วมตามบทบาท</Heading>
                                </CardHeader>
                                <CardBody p={0}>
                                    <Box h="280px">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={roleData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={95}
                                                    label={({ name, percent }: { name?: string; percent?: number }) =>
                                                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                                                    }
                                                >
                                                    {roleData.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardBody>
                            </Card>

                            {/* Province Distribution */}
                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <CardHeader p={0} mb={4}>
                                    <Heading size="sm">การกระจายตัวตามจังหวัดที่เดินทางมา</Heading>
                                </CardHeader>
                                <CardBody p={0}>
                                    <Box h="280px">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={provinceData} margin={{ bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 11 }}
                                                    interval={0}
                                                    angle={-30}
                                                    textAnchor="end"
                                                />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#F04E23" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        {/* Source Channels */}
                        <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                            <CardHeader p={0} mb={4}>
                                <Heading size="sm">ช่องทางที่รู้จักงาน (เลือกได้หลายข้อ)</Heading>
                            </CardHeader>
                            <CardBody p={0}>
                                <Box h="260px">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={sourceData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardBody>
                        </Card>

                        {/* Student Specific Section */}
                        {studentSurveys.length > 0 && (
                            <Box pt={4}>
                                <Flex align="center" gap={2} mb={4}>
                                    <Badge colorScheme="blue" fontSize="sm" px={2.5} py={1} rounded="md">
                                        มุมมองนักเรียน (Student Insights · {studentSurveys.length} คน)
                                    </Badge>
                                </Flex>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    {/* Faculty */}
                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={4}>
                                            <Heading size="sm">คณะที่สนใจ (เลือกได้ไม่เกิน 2 ข้อ)</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="280px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={studentFacultyData} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis type="number" allowDecimals={false} />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            width={120}
                                                            tick={{ fontSize: 11 }}
                                                        />
                                                        <Tooltip />
                                                        <Bar
                                                            dataKey="value"
                                                            fill="#00C49F"
                                                            radius={[0, 4, 4, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    {/* Decision Factors */}
                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={4}>
                                            <Heading size="sm">ปัจจัยสำคัญในการเลือกมหาวิทยาลัย (สูงสุด 3 ข้อ)</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="280px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={studentFactorData} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis type="number" allowDecimals={false} />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            width={130}
                                                            tick={{ fontSize: 11 }}
                                                        />
                                                        <Tooltip />
                                                        <Bar
                                                            dataKey="value"
                                                            fill="#FFBB28"
                                                            radius={[0, 4, 4, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    {/* Student Worries */}
                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={4}>
                                            <Heading size="sm">ถ้าจะมาเรียน มจธ. กังวลเรื่องใดที่สุด</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="280px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={studentWorryData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            outerRadius={85}
                                                            label
                                                        >
                                                            {studentWorryData.map((_, i) => (
                                                                <Cell
                                                                    key={i}
                                                                    fill={COLORS[i % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    {/* Class & Stream */}
                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={4}>
                                            <Heading size="sm">ระดับชั้นและแผนการเรียน</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="280px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={studentGradeData}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Bar
                                                            dataKey="value"
                                                            fill="#775DD0"
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </SimpleGrid>
                            </Box>
                        )}

                        {/* Parent Specific Section */}
                        {parentSurveys.length > 0 && (
                            <Box pt={4}>
                                <Flex align="center" gap={2} mb={4}>
                                    <Badge colorScheme="green" fontSize="sm" px={2.5} py={1} rounded="md">
                                        มุมมองผู้ปกครอง (Parent Insights · {parentSurveys.length} คน)
                                    </Badge>
                                </Flex>

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={3}>
                                            <Heading size="xs">เรื่องที่กังวลเมื่อให้บุตรหลานเรียน กทม.</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="220px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={parentWorryData} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis type="number" allowDecimals={false} />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            width={100}
                                                            tick={{ fontSize: 10 }}
                                                        />
                                                        <Tooltip />
                                                        <Bar dataKey="value" fill="#FF4560" radius={[0, 4, 4, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={3}>
                                            <Heading size="xs">ข้อมูลที่ผู้ปกครองอยากได้เพิ่ม</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="220px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={parentInfoData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            outerRadius={65}
                                                        >
                                                            {parentInfoData.map((_, i) => (
                                                                <Cell
                                                                    key={i}
                                                                    fill={COLORS[i % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={3}>
                                            <Heading size="xs">ช่องทางที่สะดวกรับข่าวสาร</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="220px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={parentChannelData}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Bar dataKey="value" fill="#00E396" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </SimpleGrid>
                            </Box>
                        )}

                        {/* Teacher Specific Section */}
                        {teacherSurveys.length > 0 && (
                            <Box pt={4}>
                                <Flex align="center" gap={2} mb={4}>
                                    <Badge colorScheme="teal" fontSize="sm" px={2.5} py={1} rounded="md">
                                        มุมมองครูแนะแนว (Teacher Insights · {teacherSurveys.length} ท่าน)
                                    </Badge>
                                </Flex>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={4}>
                                            <Heading size="sm">อยากให้ มจธ. สนับสนุนเรื่องใด</Heading>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box h="260px">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={teacherNeedsData} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                        <XAxis type="number" allowDecimals={false} />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            width={140}
                                                            tick={{ fontSize: 11 }}
                                                        />
                                                        <Tooltip />
                                                        <Bar dataKey="value" fill="#319795" radius={[0, 4, 4, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                        <CardHeader p={0} mb={3}>
                                            <Heading size="sm">ข้อมูลติดต่อโรงเรียน / ครูแนะแนวสำหรับประสานงาน</Heading>
                                            <Text fontSize="xs" color={mutedColor}>
                                                (จากครูที่ยินดีให้ข้อมูลติดต่อ)
                                            </Text>
                                        </CardHeader>
                                        <CardBody p={0}>
                                            <Box maxH="250px" overflowY="auto">
                                                {teacherContacts.length === 0 ? (
                                                    <Center py={8}>
                                                        <Text color={mutedColor} fontSize="sm">
                                                            ยังไม่มีครูกรอกข้อมูลติดต่อ
                                                        </Text>
                                                    </Center>
                                                ) : (
                                                    <Table size="sm" variant="simple">
                                                        <Thead>
                                                            <Tr>
                                                                <Th>จังหวัด</Th>
                                                                <Th>ข้อมูลติดต่อ</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {teacherContacts.map((c, idx) => (
                                                                <Tr key={idx}>
                                                                    <Td whiteSpace="nowrap">
                                                                        <Badge colorScheme="orange">
                                                                            {c.province}
                                                                        </Badge>
                                                                    </Td>
                                                                    <Td fontSize="xs">{c.contact}</Td>
                                                                </Tr>
                                                            ))}
                                                        </Tbody>
                                                    </Table>
                                                )}
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </SimpleGrid>
                            </Box>
                        )}

                        {/* Overall KPIs & Satisfaction Distribution */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <CardHeader p={0} mb={4}>
                                    <Heading size="sm">การกระจายตัว: ความอยากสมัคร / แนะนำ มจธ. (1–5)</Heading>
                                </CardHeader>
                                <CardBody p={0}>
                                    <Box h="220px">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={intentData}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                <XAxis dataKey="name" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardBody>
                            </Card>

                            <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                                <CardHeader p={0} mb={4}>
                                    <Heading size="sm">การกระจายตัว: ความพึงพอใจต่องาน (1–5)</Heading>
                                </CardHeader>
                                <CardBody p={0}>
                                    <Box h="220px">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={satData}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                <XAxis dataKey="name" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#00C49F" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        {/* Feedback Notes Table */}
                        <Card p={5} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
                            <CardHeader p={0} mb={4}>
                                <Flex justify="space-between" align="center">
                                    <Heading size="sm">ข้อเสนอแนะเพิ่มเติมจากผู้เข้าร่วมงาน</Heading>
                                    <Badge colorScheme="purple">{feedbackNotes.length} ข้อความ</Badge>
                                </Flex>
                            </CardHeader>
                            <CardBody p={0}>
                                {feedbackNotes.length === 0 ? (
                                    <Center py={8}>
                                        <Text color={mutedColor} fontSize="sm">
                                            ยังไม่มีผู้ระบุข้อเสนอแนะเพิ่มเติม
                                        </Text>
                                    </Center>
                                ) : (
                                    <Box maxH="320px" overflowY="auto">
                                        <Table size="sm" variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th w="120px">บทบาท</Th>
                                                    <Th w="120px">จังหวัด</Th>
                                                    <Th>ข้อเสนอแนะ</Th>
                                                    <Th w="140px">เวลา</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {feedbackNotes.map((fn, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>
                                                            <Badge
                                                                colorScheme={
                                                                    fn.role === "นักเรียน"
                                                                        ? "blue"
                                                                        : fn.role === "ผู้ปกครอง"
                                                                        ? "green"
                                                                        : "teal"
                                                                }
                                                            >
                                                                {fn.role}
                                                            </Badge>
                                                        </Td>
                                                        <Td fontSize="xs">{fn.province}</Td>
                                                        <Td fontSize="xs">{fn.note}</Td>
                                                        <Td fontSize="2xs" color={mutedColor}>
                                                            {new Date(fn.createdAt).toLocaleDateString(
                                                                "th-TH"
                                                            )}
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>
                    </VStack>
                )}
            </Box>
        </Box>
    )
}
