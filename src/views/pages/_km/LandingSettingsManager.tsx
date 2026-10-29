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
} from "@chakra-ui/react";
import { ViewIcon, CheckIcon, RepeatIcon } from "@chakra-ui/icons";
import KMAppLayout from "@/views/layouts/KMAppLayout";
import Link from "next/link";
import { DEFAULT_LANDING_CONFIG } from "@/interfaces/LandingContent";

const PRIMARY = "#FA4616";

export default function LandingSettingsManager() {
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.500", "gray.400");

    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Config form states
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroDateText, setHeroDateText] = useState("");
    const [heroLocationText, setHeroLocationText] = useState("");

    const [regisDeadlineText, setRegisDeadlineText] = useState("");
    const [regisLink, setRegisLink] = useState("");
    const [openChatLink, setOpenChatLink] = useState("");
    const [mapUrl, setMapUrl] = useState("");

    const [coordinatorName, setCoordinatorName] = useState("");
    const [coordinatorPhone, setCoordinatorPhone] = useState("");
    const [coordinatorEmail, setCoordinatorEmail] = useState("");

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/km/landing/config");
            if (!res.ok) throw new Error("Failed to load config");
            const data: Record<string, string> = await res.json();

            setHeroTitle(data.heroTitle ?? DEFAULT_LANDING_CONFIG.heroTitle);
            setHeroSubtitle(data.heroSubtitle ?? DEFAULT_LANDING_CONFIG.heroSubtitle);
            setHeroDateText(data.heroDateText ?? DEFAULT_LANDING_CONFIG.heroDateText);
            setHeroLocationText(data.heroLocationText ?? DEFAULT_LANDING_CONFIG.heroLocationText);

            setRegisDeadlineText(data.regisDeadlineText ?? DEFAULT_LANDING_CONFIG.regisDeadlineText);
            setRegisLink(data.regisLink ?? DEFAULT_LANDING_CONFIG.regisLink);
            setOpenChatLink(data.openChatLink ?? DEFAULT_LANDING_CONFIG.openChatLink);
            setMapUrl(data.mapUrl ?? DEFAULT_LANDING_CONFIG.mapUrl);

            setCoordinatorName(data.coordinatorName ?? DEFAULT_LANDING_CONFIG.coordinatorName);
            setCoordinatorPhone(data.coordinatorPhone ?? DEFAULT_LANDING_CONFIG.coordinatorPhone);
            setCoordinatorEmail(data.coordinatorEmail ?? DEFAULT_LANDING_CONFIG.coordinatorEmail);
        } catch (error) {
            console.error(error);
            toast({
                title: "เกิดข้อผิดพลาดในการโหลดข้อความหน้าแรก",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleResetDefaults = () => {
        setHeroTitle(DEFAULT_LANDING_CONFIG.heroTitle);
        setHeroSubtitle(DEFAULT_LANDING_CONFIG.heroSubtitle);
        setHeroDateText(DEFAULT_LANDING_CONFIG.heroDateText);
        setHeroLocationText(DEFAULT_LANDING_CONFIG.heroLocationText);

        setRegisDeadlineText(DEFAULT_LANDING_CONFIG.regisDeadlineText);
        setRegisLink(DEFAULT_LANDING_CONFIG.regisLink);
        setOpenChatLink(DEFAULT_LANDING_CONFIG.openChatLink);
        setMapUrl(DEFAULT_LANDING_CONFIG.mapUrl);

        setCoordinatorName(DEFAULT_LANDING_CONFIG.coordinatorName);
        setCoordinatorPhone(DEFAULT_LANDING_CONFIG.coordinatorPhone);
        setCoordinatorEmail(DEFAULT_LANDING_CONFIG.coordinatorEmail);

        toast({
            title: "คืนค่าเริ่มต้นเรียบร้อยแล้ว",
            description: "อย่าลืมกดปุ่ม 'บันทึกการเปลี่ยนแปลง' เพื่อให้มีผลในระบบ",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                heroTitle: heroTitle.trim(),
                heroSubtitle: heroSubtitle.trim(),
                heroDateText: heroDateText.trim(),
                heroLocationText: heroLocationText.trim(),
                regisDeadlineText: regisDeadlineText.trim(),
                regisLink: regisLink.trim(),
                openChatLink: openChatLink.trim(),
                mapUrl: mapUrl.trim(),
                coordinatorName: coordinatorName.trim(),
                coordinatorPhone: coordinatorPhone.trim(),
                coordinatorEmail: coordinatorEmail.trim(),
            };

            const res = await fetch("/api/km/landing/config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update landing config");
            }

            toast({
                title: "บันทึกข้อความหน้าแรกเรียบร้อยแล้ว",
                description: "หน้าเว็บแรก (Landing Page) ได้รับการอัปเดตแล้ว",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
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
                            ⚙️ จัดการข้อความ & ข้อมูลหน้าแรก (Landing Settings)
                        </Heading>
                        <Text color={subTextColor} fontSize="sm">
                            ปรับเปลี่ยนข้อความส่วนหัว วันที่จัดงาน สถานที่ ลิงก์ลงทะเบียน และผู้ประสานงานหลัก
                        </Text>
                    </Box>

                    <HStack spacing={3}>
                        <Link href="/" target="_blank">
                            <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<ViewIcon />}
                                colorScheme="orange"
                            >
                                ดูหน้าเว็บจริง
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<RepeatIcon />}
                            onClick={handleResetDefaults}
                        >
                            คืนค่าเริ่มต้น
                        </Button>
                        <Button
                            size="sm"
                            bg={PRIMARY}
                            _hover={{ bg: "#E0380B" }}
                            color="white"
                            leftIcon={<CheckIcon />}
                            isLoading={saving}
                            onClick={handleSave}
                        >
                            บันทึกการเปลี่ยนแปลง
                        </Button>
                    </HStack>
                </Flex>

                <Alert
                    status="info"
                    variant="subtle"
                    rounded="2xl"
                    border="1px solid"
                    borderColor="orange.200"
                    mb={6}
                >
                    <AlertIcon />
                    <Box fontSize="sm">
                        <Text fontWeight="bold">ข้อควรระวังในการแก้ไข:</Text>
                        <Text>
                            ข้อความทั้งหมดที่บันทึกที่นี่จะมีผลต่อผู้เข้าชมเว็บไซต์หน้าแรกทุกคนทันที โดยไม่ต้อง Build หรือ Deploy ใหม่
                        </Text>
                    </Box>
                </Alert>

                <VStack spacing={6} align="stretch">
                    {/* Section 1: Hero Info */}
                    <Card rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <HStack spacing={2}>
                                <Badge colorScheme="orange" px={2} py={0.5} rounded="md">
                                    ส่วนหัวหลัก (Hero Section)
                                </Badge>
                                <Heading size="md" color={textColor}>
                                    หัวข้องาน & วันเวลาสถานที่
                                </Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        ชื่องานหลัก (Hero Title)
                                    </FormLabel>
                                    <Input
                                        value={heroTitle}
                                        onChange={(e) => setHeroTitle(e.target.value)}
                                        size="md"
                                        rounded="xl"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        ชื่อรองของงาน (Hero Subtitle)
                                    </FormLabel>
                                    <Input
                                        value={heroSubtitle}
                                        onChange={(e) => setHeroSubtitle(e.target.value)}
                                        size="md"
                                        rounded="xl"
                                    />
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            วันเวลาจัดงาน (Date & Time Text)
                                        </FormLabel>
                                        <Input
                                            value={heroDateText}
                                            onChange={(e) => setHeroDateText(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            สถานที่จัดงาน (Location Text)
                                        </FormLabel>
                                        <Input
                                            value={heroLocationText}
                                            onChange={(e) => setHeroLocationText(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Section 2: Registration Links */}
                    <Card rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <HStack spacing={2}>
                                <Badge colorScheme="green" px={2} py={0.5} rounded="md">
                                    การลงทะเบียน & ลิงก์สำคัญ
                                </Badge>
                                <Heading size="md" color={textColor}>
                                    ลิงก์รับสมัคร & OpenChat
                                </Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={4} align="stretch">
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        กำหนดการปิดรับลงทะเบียน (Registration Deadline)
                                    </FormLabel>
                                    <Input
                                        value={regisDeadlineText}
                                        onChange={(e) => setRegisDeadlineText(e.target.value)}
                                        size="md"
                                        rounded="xl"
                                    />
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            ลิงก์ลงทะเบียนเข้าร่วมงาน (Registration URL)
                                        </FormLabel>
                                        <Input
                                            value={regisLink}
                                            onChange={(e) => setRegisLink(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            ลิงก์ LINE OpenChat
                                        </FormLabel>
                                        <Input
                                            value={openChatLink}
                                            onChange={(e) => setOpenChatLink(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        URL แผนที่ Google Map
                                    </FormLabel>
                                    <Input
                                        value={mapUrl}
                                        onChange={(e) => setMapUrl(e.target.value)}
                                        size="md"
                                        rounded="xl"
                                    />
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Section 3: Coordinator */}
                    <Card rounded="2xl" shadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <HStack spacing={2}>
                                <Badge colorScheme="purple" px={2} py={0.5} rounded="md">
                                    ผู้ประสานงานหลัก (Coordinator)
                                </Badge>
                                <Heading size="md" color={textColor}>
                                    ข้อมูลติดต่อท้ายหน้าเว็บ
                                </Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">
                                        ชื่อผู้ประสานงาน
                                    </FormLabel>
                                    <Input
                                        value={coordinatorName}
                                        onChange={(e) => setCoordinatorName(e.target.value)}
                                        size="md"
                                        rounded="xl"
                                    />
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            เบอร์โทรศัพท์ติดต่อ
                                        </FormLabel>
                                        <Input
                                            value={coordinatorPhone}
                                            onChange={(e) => setCoordinatorPhone(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">
                                            อีเมลติดต่อ
                                        </FormLabel>
                                        <Input
                                            value={coordinatorEmail}
                                            onChange={(e) => setCoordinatorEmail(e.target.value)}
                                            size="md"
                                            rounded="xl"
                                        />
                                    </FormControl>
                                </SimpleGrid>
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
                            บันทึกการเปลี่ยนแปลงทั้งหมด
                        </Button>
                    </Flex>
                </VStack>
            </Box>
        </KMAppLayout>
    );
}

