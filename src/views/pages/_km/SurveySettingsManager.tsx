"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    HStack,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Switch,
    useToast,
    useColorModeValue,
    Divider,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    Badge,
    Icon,
    Alert,
    AlertIcon,
    IconButton,
    Tag,
    TagLabel,
    TagCloseButton,
} from "@chakra-ui/react";
import {
    ViewIcon,
    CheckIcon,
    AddIcon,
    DeleteIcon,
    TimeIcon,
    InfoOutlineIcon,
    LockIcon,
} from "@chakra-ui/icons";
import KMAppLayout from "@/views/layouts/KMAppLayout";
import Link from "next/link";
import { DEFAULT_SURVEY_CONFIG } from "@/pages/api/survey/config";

const PRIMARY = "#FA4616";

export default function SurveySettingsManager() {
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");

    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Status & dates
    const [surveyStatus, setSurveyStatus] = useState<string>("auto");
    const [startDate, setStartDate] = useState<string>("2026-10-30T00:00:00+07:00");
    const [endDate, setEndDate] = useState<string>("2026-11-06T23:59:59+07:00");
    const [currentStatus, setCurrentStatus] = useState<string>("not_started");
    const [currentTime, setCurrentTime] = useState<string>("");

    // 3 พระจอม Ranking question config (Disabled by user request)
    const [threeJomEnabled, setThreeJomEnabled] = useState<boolean>(false);
    const [threeJomTitle, setThreeJomTitle] = useState<string>(
        "ความสนใจในกลุ่ม 3 พระจอม (เรียงลำดับความสนใจที่ท่านชื่นชอบ 1-3)"
    );
    const [threeJomOptions, setThreeJomOptions] = useState<string[]>([
        "มจธ. - มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (บางมด)",
        "สจล. - สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
        "มจพ. - มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    ]);
    const [newOptionText, setNewOptionText] = useState<string>("");

    // Other survey config lists
    const [provinces, setProvinces] = useState<string[]>(DEFAULT_SURVEY_CONFIG.provinces);
    const [newProvince, setNewProvince] = useState<string>("");

    const [faculties, setFaculties] = useState<string[]>(DEFAULT_SURVEY_CONFIG.studentFaculties);
    const [newFaculty, setNewFaculty] = useState<string>("");

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/km/survey/settings");
            if (!res.ok) throw new Error("Failed to load survey settings");
            const data = await res.json();

            setSurveyStatus(data.surveyStatus || "auto");
            setStartDate(data.startDate || "2026-10-30T00:00:00+07:00");
            setEndDate(data.endDate || "2026-11-06T23:59:59+07:00");
            setCurrentStatus(data.status || "not_started");
            setCurrentTime(data.currentTime || "");

            if (data.surveyConfig) {
                if (data.surveyConfig.threeJomQuestion) {
                    setThreeJomEnabled(data.surveyConfig.threeJomQuestion.enabled ?? true);
                    setThreeJomTitle(
                        data.surveyConfig.threeJomQuestion.title ||
                        "ความสนใจในกลุ่ม 3 พระจอม (เรียงลำดับความสนใจที่ท่านชื่นชอบ 1-3)"
                    );
                    setThreeJomOptions(data.surveyConfig.threeJomQuestion.options || []);
                }
                if (Array.isArray(data.surveyConfig.provinces)) {
                    setProvinces(data.surveyConfig.provinces);
                }
                if (Array.isArray(data.surveyConfig.studentFaculties)) {
                    setFaculties(data.surveyConfig.studentFaculties);
                }
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "เกิดข้อผิดพลาดในการโหลดการตั้งค่าแบบประเมิน",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleAddThreeJomOption = () => {
        if (!newOptionText.trim()) return;
        setThreeJomOptions([...threeJomOptions, newOptionText.trim()]);
        setNewOptionText("");
    };

    const handleRemoveThreeJomOption = (index: number) => {
        setThreeJomOptions(threeJomOptions.filter((_, i) => i !== index));
    };

    const handleAddProvince = () => {
        if (!newProvince.trim() || provinces.includes(newProvince.trim())) return;
        setProvinces([...provinces, newProvince.trim()]);
        setNewProvince("");
    };

    const handleRemoveProvince = (p: string) => {
        setProvinces(provinces.filter((item) => item !== p));
    };

    const handleAddFaculty = () => {
        if (!newFaculty.trim() || faculties.includes(newFaculty.trim())) return;
        setFaculties([...faculties, newFaculty.trim()]);
        setNewFaculty("");
    };

    const handleRemoveFaculty = (f: string) => {
        setFaculties(faculties.filter((item) => item !== f));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const surveyConfig = {
                ...DEFAULT_SURVEY_CONFIG,
                provinces,
                studentFaculties: faculties,
                threeJomQuestion: {
                    enabled: threeJomEnabled,
                    title: threeJomTitle.trim(),
                    options: threeJomOptions,
                },
            };

            const payload = {
                surveyStatus,
                startDate,
                endDate,
                surveyConfig,
            };

            const res = await fetch("/api/km/survey/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to save settings");
            }

            toast({
                title: "บันทึกการตั้งค่าแบบประเมินเรียบร้อยแล้ว",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            fetchSettings();
        } catch (error: any) {
            toast({
                title: error.message || "เกิดข้อผิดพลาดในการบันทึก",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = () => {
        if (currentStatus === "open") {
            return (
                <Badge colorScheme="green" fontSize="sm" px={3} py={1} rounded="md">
                    🟢 กำลังเปิดรับคำตอบ (Open & Popup Active)
                </Badge>
            );
        }
        if (currentStatus === "not_started") {
            return (
                <Badge colorScheme="orange" fontSize="sm" px={3} py={1} rounded="md">
                    🔒 ยังไม่ถึงกำหนดเปิด (เปิด 30 ต.ค. 2569)
                </Badge>
            );
        }
        if (currentStatus === "ended") {
            return (
                <Badge colorScheme="gray" fontSize="sm" px={3} py={1} rounded="md">
                    ⏹️ สิ้นสุดระยะเวลาประเมินแล้ว (หยุดเด้งถาวร)
                </Badge>
            );
        }
        return (
            <Badge colorScheme="red" fontSize="sm" px={3} py={1} rounded="md">
                ⛔ บังคับปิดรับคำตอบ (Force Closed)
            </Badge>
        );
    };

    return (
        <KMAppLayout>
            <Box maxW="1000px" mx="auto" pb={16}>
                {/* Header */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={4}
                    mb={6}
                >
                    <Box>
                        <Heading size="lg" color={textColor} mb={1}>
                            📊 ตั้งค่าแบบสอบถาม (3 พระจอม & วันเวลาเปิด-ปิด)
                        </Heading>
                        <Text color={subTextColor} fontSize="sm">
                            จัดการคำถามจัดอันดับ 3 พระจอม กำหนดวันเวลาเปิดรับคำตอบตามเวลาจริง และควบคุมการเด้ง Popup ประเมิน
                        </Text>
                    </Box>

                    <HStack spacing={3} wrap="wrap">
                        <Link href="/survey?preview=true" target="_blank">
                            <Button size="sm" variant="outline" leftIcon={<ViewIcon />} colorScheme="orange">
                                ดูพรีวิวแบบสอบถาม
                            </Button>
                        </Link>
                        <Link href="/survey-report" target="_blank">
                            <Button size="sm" variant="outline" colorScheme="blue">
                                ดูรายงานผล
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            bg={PRIMARY}
                            _hover={{ bg: "#E0380B" }}
                            color="white"
                            leftIcon={<CheckIcon />}
                            isLoading={saving}
                            onClick={handleSave}
                        >
                            บันทึกการตั้งค่า
                        </Button>
                    </HStack>
                </Flex>

                {/* Status Indicator Banner */}
                <Card
                    rounded="2xl"
                    shadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                    mb={6}
                    bg={useColorModeValue("orange.50", "whiteAlpha.100")}
                >
                    <CardBody p={5}>
                        <Flex
                            direction={{ base: "column", sm: "row" }}
                            justify="space-between"
                            align={{ base: "flex-start", sm: "center" }}
                            gap={3}
                        >
                            <Box>
                                <HStack spacing={2} mb={1}>
                                    <TimeIcon color="orange.500" />
                                    <Text fontWeight="bold" fontSize="sm" color="orange.800">
                                        สถานะการเปิดรับคำตอบ & Popup ปัจจุบัน:
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                    เวลาเซิร์ฟเวอร์ปัจจุบัน: {currentTime ? new Date(currentTime).toLocaleString("th-TH") : "กำลังโหลด..."}
                                </Text>
                            </Box>
                            <Box>{getStatusBadge()}</Box>
                        </Flex>
                    </CardBody>
                </Card>

                <VStack spacing={6} align="stretch">
                    {/* Section 1: Real-World Timing & Popup Schedule */}
                    <Card rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <HStack spacing={2}>
                                <Badge colorScheme="orange" px={2} py={0.5} rounded="md">
                                    กำหนดการเปิด-ปิด & Popup
                                </Badge>
                                <Heading size="md" color={textColor}>
                                    ควบคุมเวลาโลกจริง (Real-World Timing)
                                </Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={4} align="stretch">
                                <Alert status="info" rounded="xl" fontSize="xs">
                                    <AlertIcon />
                                    <Box>
                                        <strong>เงื่อนไขตามข้อกำหนด:</strong>
                                        <br />
                                        1. <strong>ก่อนวันที่ 30 ต.ค. 2569:</strong> แบบสอบถามจะถูกล็อก ห้ามเปิด และห้ามเด้ง Popup เด็ดขาด
                                        <br />
                                        2. <strong>วันที่ 30 ต.ค. ถึง 6 พ.ย. 2569 (1 อาทิตย์หลังกิจกรรม):</strong> ระบบจะเปิดรับคำตอบอัตโนมัติ และจะเด้ง Popup ให้ผู้เข้าร่วมงานทำแบบประเมิน
                                        <br />
                                        3. <strong>หลังวันที่ 6 พ.ย. 2569:</strong> สิ้นสุดระยะเวลาประเมิน ระบบจะปิดรับคำตอบและ <u>หยุดเด้ง Popup ถาวร</u>
                                    </Box>
                                </Alert>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        โหมดการทำงานของแบบประเมิน (Survey Mode)
                                    </FormLabel>
                                    <Select
                                        value={surveyStatus}
                                        onChange={(e) => setSurveyStatus(e.target.value)}
                                        rounded="xl"
                                        size="md"
                                    >
                                        <option value="auto">
                                            ⏰ ทำงานตามวันเวลาจริงอัตโนมัติ (Auto: 30 ต.ค. - 6 พ.ย. 2569) [แนะนำ]
                                        </option>
                                        <option value="open">
                                            🟢 บังคับเปิดรับคำตอบทันที (Force Open - สำหรับทดสอบ)
                                        </option>
                                        <option value="closed">
                                            ⛔ บังคับปิดรับคำตอบทันที (Force Closed)
                                        </option>
                                    </Select>
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            วันเวลาเปิดรับคำตอบ (Start Date)
                                        </FormLabel>
                                        <Input
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                        <Text fontSize="2xs" color="gray.500" mt={1}>
                                            รูปแบบ ISO เช่น <code>2026-10-30T00:00:00+07:00</code>
                                        </Text>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            วันเวลาปิดรับคำตอบ & หยุดเด้ง (End Date: +1 สัปดาห์)
                                        </FormLabel>
                                        <Input
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                        <Text fontSize="2xs" color="gray.500" mt={1}>
                                            รูปแบบ ISO เช่น <code>2026-11-06T23:59:59+07:00</code>
                                        </Text>
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Section 2: 3 พระจอม Ranking Question */}
                    <Card rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <Flex justify="space-between" align="center">
                                <HStack spacing={2}>
                                    <Badge colorScheme="purple" px={2} py={0.5} rounded="md">
                                        คำถามจัดอันดับ
                                    </Badge>
                                    <Heading size="md" color={textColor}>
                                        ความสนใจในกลุ่ม 3 พระจอม (Ranking 1-3)
                                    </Heading>
                                </HStack>

                                <HStack spacing={2}>
                                    <Text fontSize="xs" fontWeight="medium" color={subTextColor}>
                                        {threeJomEnabled ? "เปิดใช้งานคำถามนี้" : "ปิดคำถามนี้"}
                                    </Text>
                                    <Switch
                                        colorScheme="orange"
                                        isChecked={threeJomEnabled}
                                        onChange={(e) => setThreeJomEnabled(e.target.checked)}
                                    />
                                </HStack>
                            </Flex>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={4} align="stretch">
                                <Text fontSize="xs" color="gray.500">
                                    ตามที่อาจารย์ต้องการให้นักเรียนจัดลำดับความชอบในกลุ่ม 3 พระจอม พี่แนทและทีมงานสามารถแก้ไขชื่อสถาบันหรือข้อความได้ที่นี่
                                </Text>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        หัวข้อคำถาม (Question Title)
                                    </FormLabel>
                                    <Input
                                        value={threeJomTitle}
                                        onChange={(e) => setThreeJomTitle(e.target.value)}
                                        size="md"
                                        rounded="xl"
                                        isDisabled={!threeJomEnabled}
                                    />
                                </FormControl>

                                <Box>
                                    <FormLabel fontSize="sm" fontWeight="bold" mb={2}>
                                        รายชื่อสถาบันที่ให้เรียงลำดับ ({threeJomOptions.length} สถาบัน)
                                    </FormLabel>
                                    <VStack spacing={2.5} align="stretch" mb={3}>
                                        {threeJomOptions.map((opt, idx) => (
                                            <HStack
                                                key={idx}
                                                p={3}
                                                rounded="xl"
                                                border="1px solid"
                                                borderColor={borderColor}
                                                bg={useColorModeValue("gray.50", "gray.750")}
                                                justify="space-between"
                                            >
                                                <HStack spacing={3}>
                                                    <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5} rounded="md">
                                                        ลำดับที่ {idx + 1}
                                                    </Badge>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {opt}
                                                    </Text>
                                                </HStack>
                                                <IconButton
                                                    aria-label="ลบตัวเลือก"
                                                    icon={<DeleteIcon />}
                                                    size="xs"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveThreeJomOption(idx)}
                                                    isDisabled={!threeJomEnabled || threeJomOptions.length <= 2}
                                                />
                                            </HStack>
                                        ))}
                                    </VStack>

                                    {/* Add Option */}
                                    <HStack spacing={2}>
                                        <Input
                                            placeholder="เพิ่มสถาบันใหม่..."
                                            value={newOptionText}
                                            onChange={(e) => setNewOptionText(e.target.value)}
                                            size="sm"
                                            rounded="xl"
                                            isDisabled={!threeJomEnabled}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddThreeJomOption();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            leftIcon={<AddIcon />}
                                            colorScheme="orange"
                                            variant="outline"
                                            onClick={handleAddThreeJomOption}
                                            isDisabled={!threeJomEnabled || !newOptionText.trim()}
                                        >
                                            เพิ่มสถาบัน
                                        </Button>
                                    </HStack>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Section 3: Provinces & Faculties List Customization */}
                    <Card rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <HStack spacing={2}>
                                <Badge colorScheme="blue" px={2} py={0.5} rounded="md">
                                    ตัวเลือกคำตอบอื่น ๆ
                                </Badge>
                                <Heading size="md" color={textColor}>
                                    ปรับแต่งจังหวัด & คณะที่สนใจ
                                </Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={6} align="stretch">
                                {/* Provinces */}
                                <Box>
                                    <FormLabel fontSize="sm" fontWeight="bold" mb={2}>
                                        รายชื่อจังหวัดในภาคอีสานและจังหวัดใกล้เคียง ({provinces.length} จังหวัด)
                                    </FormLabel>
                                    <Flex wrap="wrap" gap={2} mb={3}>
                                        {provinces.map((p) => (
                                            <Tag key={p} size="md" colorScheme="orange" borderRadius="full">
                                                <TagLabel>{p}</TagLabel>
                                                <TagCloseButton onClick={() => handleRemoveProvince(p)} />
                                            </Tag>
                                        ))}
                                    </Flex>
                                    <HStack spacing={2}>
                                        <Input
                                            placeholder="เพิ่มจังหวัดใหม่..."
                                            value={newProvince}
                                            onChange={(e) => setNewProvince(e.target.value)}
                                            size="sm"
                                            rounded="xl"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddProvince();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            leftIcon={<AddIcon />}
                                            colorScheme="orange"
                                            variant="outline"
                                            onClick={handleAddProvince}
                                            isDisabled={!newProvince.trim()}
                                        >
                                            เพิ่มจังหวัด
                                        </Button>
                                    </HStack>
                                </Box>

                                <Divider />

                                {/* Faculties */}
                                <Box>
                                    <FormLabel fontSize="sm" fontWeight="bold" mb={2}>
                                        กลุ่มคณะ/สาขาที่นักเรียนสนใจ ({faculties.length} กลุ่มคณะ)
                                    </FormLabel>
                                    <Flex wrap="wrap" gap={2} mb={3}>
                                        {faculties.map((f) => (
                                            <Tag key={f} size="md" colorScheme="blue" borderRadius="full">
                                                <TagLabel>{f}</TagLabel>
                                                <TagCloseButton onClick={() => handleRemoveFaculty(f)} />
                                            </Tag>
                                        ))}
                                    </Flex>
                                    <HStack spacing={2}>
                                        <Input
                                            placeholder="เพิ่มกลุ่มคณะ..."
                                            value={newFaculty}
                                            onChange={(e) => setNewFaculty(e.target.value)}
                                            size="sm"
                                            rounded="xl"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddFaculty();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            leftIcon={<AddIcon />}
                                            colorScheme="blue"
                                            variant="outline"
                                            onClick={handleAddFaculty}
                                            isDisabled={!newFaculty.trim()}
                                        >
                                            เพิ่มกลุ่มคณะ
                                        </Button>
                                    </HStack>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Bottom Save Action */}
                    <Flex justify="flex-end" pt={4}>
                        <Button
                            size="lg"
                            bg={PRIMARY}
                            _hover={{ bg: "#E0380B" }}
                            color="white"
                            leftIcon={<CheckIcon />}
                            isLoading={saving}
                            onClick={handleSave}
                            px={8}
                            rounded="xl"
                            shadow="md"
                        >
                            บันทึกการตั้งค่าทั้งหมด
                        </Button>
                    </Flex>
                </VStack>
            </Box>
        </KMAppLayout>
    );
}

