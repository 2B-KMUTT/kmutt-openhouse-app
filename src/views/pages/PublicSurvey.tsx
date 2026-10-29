"use client"

import { useState, useMemo, useEffect } from "react"
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    Heading,
    Divider,
    useToast,
    Center,
    useColorModeValue,
    Progress,
    Input,
    Textarea,
    Badge,
    Flex,
    Icon,
    Spinner,
    Card,
    CardBody,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import Head from "next/head"
import { CheckCircle2, AlertCircle, Clock, Lock } from "lucide-react"
import { KMUTT_CI, PRIMARY } from "@/constants/colors"

// Sub-component for perfectly aligned Rating Scales (1 - 5)
const RatingScale = ({
    value,
    onChange,
    labels = { 1: "น้อย", 3: "กลาง", 5: "มาก" },
}: {
    value: number | null
    onChange: (val: number) => void
    labels?: Record<number, string>
}) => {
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const hoverBg = useColorModeValue("orange.50", "whiteAlpha.100")

    return (
        <HStack spacing={{ base: 2, md: 3 }} justify="space-between" w="100%">
            {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = value === val
                const labelText = labels[val] || "\u00A0"

                return (
                    <Button
                        key={val}
                        flex={1}
                        h={{ base: "54px", md: "58px" }}
                        variant={isSelected ? "solid" : "outline"}
                        bg={isSelected ? KMUTT_CI.orange : "transparent"}
                        color={isSelected ? "white" : textColor}
                        borderColor={isSelected ? KMUTT_CI.orange : borderColor}
                        _hover={{
                            bg: isSelected ? KMUTT_CI.orangeHover : hoverBg,
                            borderColor: KMUTT_CI.orange,
                            transform: "translateY(-1px)",
                        }}
                        rounded="xl"
                        onClick={() => onChange(val)}
                        p={0}
                        transition="all 0.15s ease"
                    >
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            w="100%"
                            h="100%"
                            py={1}
                        >
                            <Text
                                fontWeight="bold"
                                fontSize={{ base: "md", md: "lg" }}
                                lineHeight="1"
                                mb={1.5}
                            >
                                {val}
                            </Text>
                            <Text
                                fontSize="2xs"
                                lineHeight="1.2"
                                minH="14px"
                                opacity={isSelected ? 0.95 : 0.6}
                                fontWeight={isSelected ? "semibold" : "normal"}
                            >
                                {labelText}
                            </Text>
                        </Flex>
                    </Button>
                )
            })}
        </HStack>
    )
}

// Default Options constants
const DEFAULT_PROVINCES = [
    "ร้อยเอ็ด",
    "มหาสารคาม",
    "กาฬสินธุ์",
    "ยโสธร",
    "ขอนแก่น",
    "มุกดาหาร",
    "สกลนคร",
    "นครราชสีมา",
    "นครพนม",
    "อุดรธานี",
    "อื่น ๆ",
]

const DEFAULT_SOURCE_CHANNELS = [
    "ครูที่โรงเรียน",
    "Facebook",
    "TikTok",
    "LINE",
    "รุ่นพี่ / เพื่อน",
    "ผู้ปกครอง",
    "อื่น ๆ",
]

const DEFAULT_STUDENT_GRADES = ["ม.4", "ม.5", "ม.6", "ปวช.", "อื่น ๆ"]
const DEFAULT_STUDENT_STREAMS = ["วิทย์–คณิต", "ศิลป์–คำนวณ", "ศิลป์–ภาษา", "สายอาชีพ"]
const DEFAULT_STUDENT_FACULTIES = [
    "วิศวกรรม",
    "วิทยาศาสตร์",
    "คอมพิวเตอร์ / IT",
    "สถาปัตย์ / ออกแบบ",
    "ครุศาสตร์อุตสาหกรรม",
    "ยังไม่แน่ใจ",
]
const DEFAULT_STUDENT_FACTORS = [
    "ชื่อเสียง / Ranking",
    "จบแล้วมีงานทำ",
    "มีสาขาที่อยากเรียน",
    "ทุนการศึกษา",
    "ค่าใช้จ่าย",
    "อุปกรณ์ / แลปทันสมัย",
    "ใกล้บ้าน",
    "ครู / พ่อแม่แนะนำ",
]
const DEFAULT_STUDENT_WORRIES = [
    "ค่าใช้จ่าย / ค่าครองชีพ",
    "ไกลบ้าน",
    "กลัวเรียนไม่ไหว",
    "ไม่รู้ขั้นตอนสมัคร TCAS",
    "ไม่กังวล",
]

const DEFAULT_PARENT_GRADES = ["ม.4", "ม.5", "ม.6", "ปวช.", "อื่น ๆ"]
const DEFAULT_PARENT_WORRIES = [
    "ค่าเทอม / ค่าครองชีพ",
    "หอพัก / ความปลอดภัย",
    "การเดินทางไกล",
    "งานหลังเรียนจบ",
    "การดูแลจากมหาวิทยาลัย",
]
const DEFAULT_PARENT_INFO_NEEDED = ["ทุน / กู้ยืม กยศ.", "หอพัก", "รอบการรับสมัคร", "อัตราการได้งาน"]
const DEFAULT_PARENT_CHANNELS = ["LINE", "Facebook", "ผ่านครูที่โรงเรียน", "โทรศัพท์ / SMS"]

const DEFAULT_TEACHER_NEEDS = [
    "Roadshow ที่โรงเรียน",
    "ค่ายวิชาการ",
    "ข้อมูลทุน / โรงเรียนเครือข่าย",
    "ติวเตรียม TCAS",
    "หลักสูตรเรียนล่วงหน้า เทียบโอนหน่วยกิต",
]

export const PublicSurvey = () => {
    const router = useRouter()
    const toast = useToast()

    const cardBg = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const mutedColor = useColorModeValue("gray.500", "gray.400")
    const pageBg = useColorModeValue("gray.50", "gray.900")
    const noticeBoxBg = useColorModeValue("orange.50", "whiteAlpha.100")

    // Dynamic config state
    const [configData, setConfigData] = useState<any>(null)
    const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true)

    // State: Common
    const [role, setRole] = useState<string>("นักเรียน")
    const [province, setProvince] = useState<string>("")
    const [sourceChannels, setSourceChannels] = useState<string[]>([])

    // State: นักเรียน
    const [grade, setGrade] = useState<string>("")
    const [stream, setStream] = useState<string>("")
    const [interestedFaculty, setInterestedFaculty] = useState<string[]>([])
    const [decisionFactors, setDecisionFactors] = useState<string[]>([])
    const [worryPoints, setWorryPoints] = useState<string>("")

    // State: ผู้ปกครอง
    const [parentGrade, setParentGrade] = useState<string>("")
    const [parentWorries, setParentWorries] = useState<string[]>([])
    const [parentInfoNeeded, setParentInfoNeeded] = useState<string>("")
    const [parentContactChannel, setParentContactChannel] = useState<string>("")

    // State: ครูแนะแนว
    const [teacherNeeds, setTeacherNeeds] = useState<string[]>([])
    const [teacherCreditTransferInterest, setTeacherCreditTransferInterest] = useState<number | null>(null)
    const [teacherSchoolContact, setTeacherSchoolContact] = useState<string>("")

    // State: ปิดท้าย
    const [recommendIntent, setRecommendIntent] = useState<number | null>(null)
    const [overallSatisfaction, setOverallSatisfaction] = useState<number | null>(null)
    const [feedbackNote, setFeedbackNote] = useState<string>("")

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // Fetch survey status & config
    useEffect(() => {
        fetch("/api/survey/config")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load config")
                return res.json()
            })
            .then((data) => {
                setConfigData(data)
            })
            .catch((err) => {
                console.error("Error loading survey config:", err)
            })
            .finally(() => {
                setIsLoadingConfig(false)
            })
    }, [])

    const isPreview = router.query.preview === "true"

    // Derive active option sets from dynamic config or defaults
    const provinces = configData?.surveyConfig?.provinces || DEFAULT_PROVINCES
    const sourceChannelsList = configData?.surveyConfig?.sourceChannels || DEFAULT_SOURCE_CHANNELS
    const studentGrades = configData?.surveyConfig?.studentGrades || DEFAULT_STUDENT_GRADES
    const studentStreams = configData?.surveyConfig?.studentStreams || DEFAULT_STUDENT_STREAMS
    const studentFaculties = configData?.surveyConfig?.studentFaculties || DEFAULT_STUDENT_FACULTIES
    const studentFactors = configData?.surveyConfig?.studentFactors || DEFAULT_STUDENT_FACTORS
    const studentWorries = configData?.surveyConfig?.studentWorries || DEFAULT_STUDENT_WORRIES
    const parentGrades = configData?.surveyConfig?.parentGrades || DEFAULT_PARENT_GRADES
    const parentWorriesList = configData?.surveyConfig?.parentWorries || DEFAULT_PARENT_WORRIES
    const parentInfoList = configData?.surveyConfig?.parentInfoNeeded || DEFAULT_PARENT_INFO_NEEDED
    const parentChannelsList = configData?.surveyConfig?.parentChannels || DEFAULT_PARENT_CHANNELS
    const teacherNeedsList = configData?.surveyConfig?.teacherNeeds || DEFAULT_TEACHER_NEEDS

    // Helper for multi-select chips with max limit
    const toggleMultiSelect = (
        currentList: string[],
        setList: (val: string[]) => void,
        item: string,
        max?: number
    ) => {
        if (currentList.includes(item)) {
            setList(currentList.filter((x) => x !== item))
        } else {
            if (max && currentList.length >= max) {
                toast({
                    title: `เลือกได้สูงสุดไม่เกิน ${max} ข้อ`,
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                })
                return
            }
            setList([...currentList, item])
        }
    }

    // Calculate completion progress
    const progressPercent = useMemo(() => {
        let totalRequired = 5 // role, province, sourceChannels, recommendIntent, overallSatisfaction
        let answered = 0

        if (role) answered++
        if (province) answered++
        if (sourceChannels.length > 0) answered++
        if (recommendIntent !== null) answered++
        if (overallSatisfaction !== null) answered++

        if (role === "นักเรียน") {
            totalRequired += 5
            if (grade) answered++
            if (stream) answered++
            if (interestedFaculty.length > 0) answered++
            if (decisionFactors.length > 0) answered++
            if (worryPoints) answered++
        } else if (role === "ผู้ปกครอง") {
            totalRequired += 4
            if (parentGrade) answered++
            if (parentWorries.length > 0) answered++
            if (parentInfoNeeded) answered++
            if (parentContactChannel) answered++
        } else if (role === "ครู / ครูแนะแนว") {
            totalRequired += 2
            if (teacherNeeds.length > 0) answered++
            if (teacherCreditTransferInterest !== null) answered++
        }

        return Math.min(100, Math.round((answered / totalRequired) * 100))
    }, [
        role,
        province,
        sourceChannels,
        grade,
        stream,
        interestedFaculty,
        decisionFactors,
        worryPoints,
        parentGrade,
        parentWorries,
        parentInfoNeeded,
        parentContactChannel,
        teacherNeeds,
        teacherCreditTransferInterest,
        recommendIntent,
        overallSatisfaction,
    ])

    const handleSubmit = async () => {
        // Validation
        if (!role) {
            toast({ title: "กรุณาเลือกประเภทผู้ตอบแบบสอบถาม", status: "error" })
            return
        }
        if (!province) {
            toast({ title: "กรุณาเลือกจังหวัดที่ท่านเดินทางมา", status: "error" })
            return
        }
        if (sourceChannels.length === 0) {
            toast({ title: "กรุณาเลือกช่องทางที่รู้จักงานอย่างน้อย 1 ช่องทาง", status: "error" })
            return
        }

        if (role === "นักเรียน") {
            if (!grade) {
                toast({ title: "กรุณาเลือกระดับชั้นที่กำลังศึกษา", status: "error" })
                return
            }
            if (!stream) {
                toast({ title: "กรุณาเลือกแผนการเรียน", status: "error" })
                return
            }
            if (interestedFaculty.length === 0) {
                toast({ title: "กรุณาเลือกคณะที่สนใจอย่างน้อย 1 ข้อ", status: "error" })
                return
            }
            if (decisionFactors.length === 0) {
                toast({ title: "กรุณาเลือกปัจจัยที่สำคัญที่สุดอย่างน้อย 1 ข้อ", status: "error" })
                return
            }
            if (!worryPoints) {
                toast({ title: "กรุณาเลือกเรื่องที่กังวลที่สุดหากมาเรียน มจธ.", status: "error" })
                return
            }
        } else if (role === "ผู้ปกครอง") {
            if (!parentGrade) {
                toast({ title: "กรุณาเลือกระดับชั้นของบุตรหลาน", status: "error" })
                return
            }
            if (parentWorries.length === 0) {
                toast({ title: "กรุณาเลือกเรื่องที่กังวลเมื่อให้บุตรหลานเรียนกรุงเทพฯ", status: "error" })
                return
            }
            if (!parentInfoNeeded) {
                toast({ title: "กรุณาเลือกข้อมูลที่อยากได้เพิ่ม", status: "error" })
                return
            }
            if (!parentContactChannel) {
                toast({ title: "กรุณาเลือกช่องทางที่สะดวกรับข่าวสาร", status: "error" })
                return
            }
        } else if (role === "ครู / ครูแนะแนว") {
            if (teacherNeeds.length === 0) {
                toast({ title: "กรุณาเลือกเรื่องที่อยากให้ มจธ. สนับสนุน", status: "error" })
                return
            }
            if (teacherCreditTransferInterest === null) {
                toast({ title: "กรุณาประเมินความสนใจหลักสูตรเรียนล่วงหน้า/เทียบโอน", status: "error" })
                return
            }
        }

        if (recommendIntent === null) {
            toast({ title: "กรุณาประเมินระดับความอยากสมัคร/แนะนำให้มาเรียน มจธ.", status: "error" })
            return
        }
        if (overallSatisfaction === null) {
            toast({ title: "กรุณาประเมินระดับความพึงพอใจต่องานวันนี้", status: "error" })
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                role,
                province,
                sourceChannels,
                grade: role === "นักเรียน" ? grade : null,
                stream: role === "นักเรียน" ? stream : null,
                interestedFaculty: role === "นักเรียน" ? interestedFaculty : [],
                decisionFactors: role === "นักเรียน" ? decisionFactors : [],
                worryPoints: role === "นักเรียน" ? worryPoints : null,
                parentGrade: role === "ผู้ปกครอง" ? parentGrade : null,
                parentWorries: role === "ผู้ปกครอง" ? parentWorries : [],
                parentInfoNeeded: role === "ผู้ปกครอง" ? parentInfoNeeded : null,
                parentContactChannel: role === "ผู้ปกครอง" ? parentContactChannel : null,
                teacherNeeds: role === "ครู / ครูแนะแนว" ? teacherNeeds : [],
                teacherCreditTransferInterest:
                    role === "ครู / ครูแนะแนว" ? teacherCreditTransferInterest : null,
                teacherSchoolContact: role === "ครู / ครูแนะแนว" ? teacherSchoolContact : null,
                recommendIntent,
                overallSatisfaction,
                feedbackNote,
            }

            const res = await fetch("/api/survey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || "เกิดข้อผิดพลาดในการส่งแบบสอบถาม")
            }

            try {
                localStorage.setItem("doneSurveyXSIT", "true")
            } catch (e) {
                console.error("Failed to set localStorage", e)
            }

            toast({
                title: "ส่งแบบสอบถามเรียบร้อยแล้ว",
                description: "ขอขอบคุณสำหรับข้อมูลอันมีค่าของท่าน",
                status: "success",
                duration: 3000,
                isClosable: true,
            })

            router.push("/")
        } catch (error: unknown) {
            console.error(error)
            toast({
                title: "เกิดข้อผิดพลาด",
                description: (error as Error).message,
                status: "error",
                duration: 4000,
                isClosable: true,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoadingConfig) {
        return (
            <Box minH="100vh" py={20} px={4} bg={pageBg}>
                <Center flexDirection="column">
                    <Spinner size="xl" color="orange.500" thickness="4px" speed="0.65s" mb={4} />
                    <Text color={mutedColor} fontSize="md">กำลังตรวจสอบสถานะแบบประเมิน...</Text>
                </Center>
            </Box>
        )
    }

    // Locked Screen: Survey Not Started Yet
    if (!isPreview && configData?.status === "not_started") {
        return (
            <Box minH="100vh" py={{ base: 12, md: 20 }} px={4} bg={pageBg}>
                <Head>
                    <title>แบบประเมินยังไม่เปิดให้บริการ · KMUTT Open House</title>
                </Head>
                <Center>
                    <Card maxW="560px" w="100%" rounded="3xl" shadow="xl" border="1px solid" borderColor={borderColor}>
                        <CardBody p={{ base: 8, md: 10 }} textAlign="center">
                            <Center
                                w="80px"
                                h="80px"
                                rounded="full"
                                bg="orange.100"
                                color="orange.600"
                                mx="auto"
                                mb={6}
                            >
                                <Icon as={Clock} w={10} h={10} />
                            </Center>
                            <Badge colorScheme="orange" px={3} py={1} rounded="full" fontSize="sm" mb={3}>
                                ยังไม่ถึงเวลาเปิดให้ประเมิน
                            </Badge>
                            <Heading fontSize={{ base: "xl", md: "2xl" }} color="gray.800" mb={3}>
                                แบบประเมินยังไม่เปิดให้บริการ
                            </Heading>
                            <Text color="gray.600" fontSize="md" mb={6} lineHeight="tall">
                                แบบสอบถามความพึงพอใจจะเปิดให้ร่วมตอบความคิดเห็นอัตโนมัติในวันกิจกรรม <br />
                                <strong>วันศุกร์ที่ 30 ตุลาคม 2569 เวลา 00:00 น. เป็นต้นไป</strong>
                            </Text>
                            <Box
                                p={4}
                                rounded="2xl"
                                bg={noticeBoxBg}
                                border="1px dashed"
                                borderColor="orange.300"
                                mb={8}
                            >
                                <HStack justify="center" spacing={2} color="orange.800">
                                    <Icon as={Lock} w={4} h={4} />
                                    <Text fontSize="sm" fontWeight="medium">
                                        ระบบจะเปิดรับคำตอบและแจ้งเตือนให้ทำประเมินระหว่างช่วงจัดงาน
                                    </Text>
                                </HStack>
                            </Box>
                            <Button
                                colorScheme="orange"
                                size="lg"
                                rounded="xl"
                                w="100%"
                                onClick={() => router.push("/")}
                            >
                                กลับหน้าหลัก
                            </Button>
                        </CardBody>
                    </Card>
                </Center>
            </Box>
        )
    }

    // Locked Screen: Survey Ended or Force Closed
    if (!isPreview && (configData?.status === "ended" || configData?.status === "closed")) {
        return (
            <Box minH="100vh" py={{ base: 12, md: 20 }} px={4} bg={pageBg}>
                <Head>
                    <title>แบบประเมินปิดรับคำตอบแล้ว · KMUTT Open House</title>
                </Head>
                <Center>
                    <Card maxW="560px" w="100%" rounded="3xl" shadow="xl" border="1px solid" borderColor={borderColor}>
                        <CardBody p={{ base: 8, md: 10 }} textAlign="center">
                            <Center
                                w="80px"
                                h="80px"
                                rounded="full"
                                bg="gray.100"
                                color="gray.600"
                                mx="auto"
                                mb={6}
                            >
                                <Icon as={CheckCircle2} w={10} h={10} />
                            </Center>
                            <Badge colorScheme="gray" px={3} py={1} rounded="full" fontSize="sm" mb={3}>
                                สิ้นสุดระยะเวลารับฟังความคิดเห็น
                            </Badge>
                            <Heading fontSize={{ base: "xl", md: "2xl" }} color="gray.800" mb={3}>
                                แบบประเมินปิดรับคำตอบแล้ว
                            </Heading>
                            <Text color="gray.600" fontSize="md" mb={6} lineHeight="tall">
                                ทางคณะผู้จัดงานขอขอบพระคุณทุกท่านที่ได้เข้าร่วมงาน KMUTT Open House <br />
                                และได้สละเวลาร่วมตอบแบบประเมินเพื่อนำไปพัฒนาการจัดงานในครั้งต่อไป
                            </Text>
                            <Button
                                colorScheme="orange"
                                size="lg"
                                rounded="xl"
                                w="100%"
                                onClick={() => router.push("/")}
                            >
                                กลับหน้าหลัก
                            </Button>
                        </CardBody>
                    </Card>
                </Center>
            </Box>
        )
    }

    return (
        <Box
            minH="100vh"
            py={{ base: 6, md: 10 }}
            px={{ base: 4, md: 8 }}
            bg={pageBg}
        >
            <Head>
                <title>แบบสอบถาม เปิดเฮือน มจธ. (ร้อยเอ็ด)</title>
                <meta name="description" content="แบบสอบถามความคิดเห็น เปิดเฮือน มจธ. ร้อยเอ็ด" />
            </Head>

            <Box maxW="720px" mx="auto">
                {/* Header Card */}
                <Box
                    bg={cardBg}
                    p={{ base: 6, md: 8 }}
                    rounded="2xl"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor={borderColor}
                    mb={6}
                >
                    <HStack justify="space-between" align="center" mb={2}>
                        <Badge colorScheme="orange" px={2.5} py={0.5} rounded="md">
                            KMUTT Open House · ร้อยเอ็ด
                        </Badge>
                        {isPreview && (
                            <Badge colorScheme="purple" px={2} py={0.5} rounded="md">
                                โหมดพรีวิว (Admin Preview)
                            </Badge>
                        )}
                    </HStack>
                    <Heading fontSize={{ base: "xl", md: "2xl" }} color="orange.600" mb={2}>
                        แบบสอบถาม เปิดเฮือน มจธ.
                    </Heading>
                    <Text fontSize="sm" color={mutedColor} mb={4}>
                        ขอความร่วมมือตอบแบบสอบถามสั้น ๆ ประมาณ 2 นาที
                        คำตอบของท่านจะช่วยให้ มจธ. จัดกิจกรรมแนะแนวได้ตรงกับความต้องการของนักเรียน
                        ผู้ปกครอง และครูในภาคอีสานมากยิ่งขึ้น
                    </Text>

                    {/* Progress Bar */}
                    <Box pt={2}>
                        <Flex justify="space-between" align="center" mb={1.5}>
                            <Text fontSize="xs" fontWeight="semibold" color={mutedColor}>
                                ความคืบหน้าในการตอบ
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="orange.500">
                                {progressPercent}%
                            </Text>
                        </Flex>
                        <Progress
                            value={progressPercent}
                            size="sm"
                            colorScheme="orange"
                            rounded="full"
                            hasStripe
                            isAnimated
                        />
                    </Box>
                </Box>

                {/* Form Card */}
                <Box
                    bg={cardBg}
                    p={{ base: 6, md: 8 }}
                    rounded="2xl"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor={borderColor}
                >
                    <VStack spacing={7} align="stretch">
                        {/* ----------------- Section: ข้อมูลทั่วไป ----------------- */}
                        <Box>
                            <Badge colorScheme="purple" px={2} py={0.5} rounded="md" mb={4}>
                                ข้อมูลทั่วไป
                            </Badge>

                            {/* Q1: Role */}
                            <Box mb={6}>
                                <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                    1. คุณคือ <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Flex wrap="wrap" gap={2.5}>
                                    {["นักเรียน", "ผู้ปกครอง", "ครู / ครูแนะแนว"].map((r) => {
                                        const isSelected = role === r
                                        return (
                                            <Button
                                                key={r}
                                                size="sm"
                                                rounded="full"
                                                px={4}
                                                py={2}
                                                variant={isSelected ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setRole(r)}
                                            >
                                                {r}
                                            </Button>
                                        )
                                    })}
                                </Flex>
                            </Box>

                            {/* Q2: Province */}
                            <Box mb={6}>
                                <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                    2. มาจากจังหวัด <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Flex wrap="wrap" gap={2}>
                                    {provinces.map((p: string) => {
                                        const isSelected = province === p
                                        return (
                                            <Button
                                                key={p}
                                                size="sm"
                                                rounded="full"
                                                variant={isSelected ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setProvince(p)}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    })}
                                </Flex>
                            </Box>

                            {/* Q3: Source channels */}
                            <Box>
                                <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                    3. รู้จักงานนี้จากช่องทางใด <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Text fontSize="xs" color={mutedColor} mb={3}>
                                    (เลือกได้หลายข้อ)
                                </Text>
                                <Flex wrap="wrap" gap={2}>
                                    {sourceChannelsList.map((src: string) => {
                                        const isSelected = sourceChannels.includes(src)
                                        return (
                                            <Button
                                                key={src}
                                                size="sm"
                                                rounded="full"
                                                variant={isSelected ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() =>
                                                    toggleMultiSelect(sourceChannels, setSourceChannels, src)
                                                }
                                            >
                                                {src}
                                            </Button>
                                        )
                                    })}
                                </Flex>
                            </Box>
                        </Box>

                        <Divider />

                        {/* ----------------- Section: เฉพาะนักเรียน ----------------- */}
                        {role === "นักเรียน" && (
                            <Box>
                                <Badge colorScheme="blue" px={2} py={0.5} rounded="md" mb={4}>
                                    สำหรับนักเรียน
                                </Badge>

                                {/* Q4: Grade */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                        4. กำลังเรียนชั้น <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {studentGrades.map((g: string) => (
                                            <Button
                                                key={g}
                                                size="sm"
                                                rounded="full"
                                                variant={grade === g ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setGrade(g)}
                                            >
                                                {g}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>

                                {/* Q5: Stream */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                        5. แผนการเรียน <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {studentStreams.map((st: string) => (
                                            <Button
                                                key={st}
                                                size="sm"
                                                rounded="full"
                                                variant={stream === st ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setStream(st)}
                                            >
                                                {st}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>

                                {/* Q6: Interested Faculty */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                        6. คณะที่สนใจ <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} mb={3}>
                                        (เลือกได้ไม่เกิน 2 ข้อ · เลือกแล้ว {interestedFaculty.length}/2)
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {studentFaculties.map((fac: string) => {
                                            const isSelected = interestedFaculty.includes(fac)
                                            return (
                                                <Button
                                                    key={fac}
                                                    size="sm"
                                                    rounded="full"
                                                    variant={isSelected ? "solid" : "outline"}
                                                    colorScheme="orange"
                                                    onClick={() =>
                                                        toggleMultiSelect(
                                                            interestedFaculty,
                                                            setInterestedFaculty,
                                                            fac,
                                                            2
                                                        )
                                                    }
                                                >
                                                    {fac}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                </Box>

                                {/* Q7: Decision factors */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                        7. เรื่องที่สำคัญที่สุดในการเลือกมหาวิทยาลัย <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} mb={3}>
                                        (เลือกได้ไม่เกิน 3 ข้อ · เลือกแล้ว {decisionFactors.length}/3)
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {studentFactors.map((fact: string) => {
                                            const isSelected = decisionFactors.includes(fact)
                                            return (
                                                <Button
                                                    key={fact}
                                                    size="sm"
                                                    rounded="full"
                                                    variant={isSelected ? "solid" : "outline"}
                                                    colorScheme="orange"
                                                    onClick={() =>
                                                        toggleMultiSelect(
                                                            decisionFactors,
                                                            setDecisionFactors,
                                                            fact,
                                                            3
                                                        )
                                                    }
                                                >
                                                    {fact}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                </Box>

                                {/* Q8: Worry */}
                                <Box>
                                    <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                        8. ถ้าจะมาเรียน มจธ. กังวลเรื่องใดที่สุด <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {studentWorries.map((w: string) => (
                                            <Button
                                                key={w}
                                                size="sm"
                                                rounded="full"
                                                variant={worryPoints === w ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setWorryPoints(w)}
                                            >
                                                {w}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>
                            </Box>
                        )}

                        {/* ----------------- Section: เฉพาะผู้ปกครอง ----------------- */}
                        {role === "ผู้ปกครอง" && (
                            <Box>
                                <Badge colorScheme="green" px={2} py={0.5} rounded="md" mb={4}>
                                    สำหรับผู้ปกครอง
                                </Badge>

                                {/* Q4: Parent Grade */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                        4. บุตรหลานกำลังเรียนชั้น <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {parentGrades.map((g: string) => (
                                            <Button
                                                key={g}
                                                size="sm"
                                                rounded="full"
                                                variant={parentGrade === g ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setParentGrade(g)}
                                            >
                                                {g}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>

                                {/* Q5: Parent Worries */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                        5. เรื่องที่กังวลเมื่อให้บุตรหลานเรียนกรุงเทพฯ <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} mb={3}>
                                        (เลือกได้ไม่เกิน 2 ข้อ · เลือกแล้ว {parentWorries.length}/2)
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {parentWorriesList.map((pw: string) => {
                                            const isSelected = parentWorries.includes(pw)
                                            return (
                                                <Button
                                                    key={pw}
                                                    size="sm"
                                                    rounded="full"
                                                    variant={isSelected ? "solid" : "outline"}
                                                    colorScheme="orange"
                                                    onClick={() =>
                                                        toggleMultiSelect(
                                                            parentWorries,
                                                            setParentWorries,
                                                            pw,
                                                            2
                                                        )
                                                    }
                                                >
                                                    {pw}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                </Box>

                                {/* Q6: Parent Info Needed */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                        6. อยากได้ข้อมูลเรื่องใดเพิ่ม <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {parentInfoList.map((info: string) => (
                                            <Button
                                                key={info}
                                                size="sm"
                                                rounded="full"
                                                variant={parentInfoNeeded === info ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setParentInfoNeeded(info)}
                                            >
                                                {info}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>

                                {/* Q7: Parent Channel */}
                                <Box>
                                    <Text fontWeight="semibold" fontSize="md" mb={3} color={textColor}>
                                        7. สะดวกรับข่าวทางใด <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {parentChannelsList.map((ch: string) => (
                                            <Button
                                                key={ch}
                                                size="sm"
                                                rounded="full"
                                                variant={parentContactChannel === ch ? "solid" : "outline"}
                                                colorScheme="orange"
                                                onClick={() => setParentContactChannel(ch)}
                                            >
                                                {ch}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>
                            </Box>
                        )}

                        {/* ----------------- Section: เฉพาะครูแนะแนว ----------------- */}
                        {role === "ครู / ครูแนะแนว" && (
                            <Box>
                                <Badge colorScheme="teal" px={2} py={0.5} rounded="md" mb={4}>
                                    สำหรับครู / ครูแนะแนว
                                </Badge>

                                {/* Q4: Teacher Needs */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                        4. อยากให้ มจธ. สนับสนุนเรื่องใด <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} mb={3}>
                                        (เลือกได้ไม่เกิน 2 ข้อ · เลือกแล้ว {teacherNeeds.length}/2)
                                    </Text>
                                    <Flex wrap="wrap" gap={2}>
                                        {teacherNeedsList.map((tn: string) => {
                                            const isSelected = teacherNeeds.includes(tn)
                                            return (
                                                <Button
                                                    key={tn}
                                                    size="sm"
                                                    rounded="full"
                                                    variant={isSelected ? "solid" : "outline"}
                                                    colorScheme="orange"
                                                    onClick={() =>
                                                        toggleMultiSelect(
                                                            teacherNeeds,
                                                            setTeacherNeeds,
                                                            tn,
                                                            2
                                                        )
                                                    }
                                                >
                                                    {tn}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                </Box>

                                {/* Q5: Credit Transfer Interest */}
                                <Box mb={6}>
                                    <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                        5. ถ้ามีหลักสูตรเรียนล่วงหน้าและเทียบโอนหน่วยกิต โรงเรียนสนใจแค่ไหน <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} mb={3}>
                                        (สเกล 1 = น้อยที่สุด, 5 = มากที่สุด)
                                    </Text>
                                    <RatingScale
                                        value={teacherCreditTransferInterest}
                                        onChange={setTeacherCreditTransferInterest}
                                    />
                                </Box>

                                {/* Q6: School Contact */}
                                <Box>
                                    <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                        6. ชื่อโรงเรียน เบอร์ติดต่อ และอีเมล{" "}
                                        <Text as="span" color={mutedColor} fontSize="sm">
                                            (ไม่บังคับ)
                                        </Text>
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor} mb={2}>
                                        ข้อมูลนี้ใช้เพื่อประสานงานกิจกรรมแนะแนวของ มจธ. เท่านั้น
                                    </Text>
                                    <Input
                                        placeholder="เช่น โรงเรียนร้อยเอ็ดวิทยาลัย, ครูสมชาย 081-xxx-xxxx, somchai@school.ac.th"
                                        value={teacherSchoolContact}
                                        onChange={(e) => setTeacherSchoolContact(e.target.value)}
                                        rounded="xl"
                                        size="md"
                                    />
                                </Box>
                            </Box>
                        )}

                        <Divider />

                        {/* ----------------- Section: ปิดท้าย (ทุกคน) ----------------- */}
                        <Box>
                            <Badge colorScheme="orange" px={2} py={0.5} rounded="md" mb={4}>
                                ส่วนปิดท้าย
                            </Badge>

                            {/* Intent */}
                            <Box mb={6}>
                                <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                    หลังจากมางานนี้ อยากสมัคร / แนะนำให้มาเรียน มจธ. แค่ไหน <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Text fontSize="xs" color={mutedColor} mb={3}>
                                    (1 = น้อยที่สุด, 5 = มากที่สุด)
                                </Text>
                                <RatingScale
                                    value={recommendIntent}
                                    onChange={setRecommendIntent}
                                />
                            </Box>

                            {/* Satisfaction */}
                            <Box mb={6}>
                                <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                    ความพึงพอใจต่องานวันนี้ <Text as="span" color="red.500">*</Text>
                                </Text>
                                <Text fontSize="xs" color={mutedColor} mb={3}>
                                    (1 = น้อยที่สุด, 5 = มากที่สุด)
                                </Text>
                                <RatingScale
                                    value={overallSatisfaction}
                                    onChange={setOverallSatisfaction}
                                />
                            </Box>

                            {/* Feedback Note */}
                            <Box>
                                <Text fontWeight="semibold" fontSize="md" mb={1} color={textColor}>
                                    อยากบอกอะไรเพิ่ม{" "}
                                    <Text as="span" color={mutedColor} fontSize="sm">
                                        (ไม่บังคับ)
                                    </Text>
                                </Text>
                                <Textarea
                                    placeholder="ข้อเสนอแนะเพิ่มเติม สิ่งที่ประทับใจ หรือสิ่งที่อยากให้จัดในครั้งถัดไป..."
                                    value={feedbackNote}
                                    onChange={(e) => setFeedbackNote(e.target.value)}
                                    rows={3}
                                    rounded="xl"
                                />
                            </Box>
                        </Box>

                        <Divider />

                        {/* Submit Button */}
                        <Box pt={2}>
                            <Button
                                colorScheme="orange"
                                size="lg"
                                w="100%"
                                h="52px"
                                rounded="xl"
                                fontSize="md"
                                fontWeight="bold"
                                shadow="md"
                                isLoading={isSubmitting}
                                loadingText="กำลังส่งแบบสอบถาม..."
                                onClick={handleSubmit}
                            >
                                ส่งแบบสอบถาม
                            </Button>
                        </Box>
                    </VStack>
                </Box>
            </Box>
        </Box>
    )
}

export default PublicSurvey
