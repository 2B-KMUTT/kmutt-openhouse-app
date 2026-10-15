"use client";

import {
    Box,
    Flex,
    Heading,
    Text,
    HStack,
    VStack,
    SimpleGrid,
    Container,
    useColorModeValue,
} from "@chakra-ui/react";
import { Users, QrCode, BarChart3, GraduationCap } from "lucide-react";
import Link from "next/link";
import BoothSection from "./BoothSection";

// KMUTT Colors
const PRIMARY = "#F04E23"; // Orange Red
const SECONDARY = "#FFC233"; // Yellow

export function LandingSections() {
    const cardBg = useColorModeValue("whiteAlpha.800", "gray.800");
    const textColor = useColorModeValue("gray.700", "gray.200");
    const borderColor = useColorModeValue("orange.100", "gray.700");

    return (

        <>
            {/* ===== HOW IT WORKS ===== */}
            {/* <Box as="section" id="how" py={20} px={6}>
                <Container maxW="7xl" textAlign="center">
                    <Heading size="2xl" mb={4}>
                        เริ่มต้นใช้งานใน 4 ขั้นตอน
                    </Heading>
                    <Text color={textColor} maxW="2xl" mx="auto">
                        ออกแบบมาให้ใช้งานง่ายทั้งนักเรียนและเจ้าหน้าที่
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} mt={12}>
                        {[
                            { title: "สมัคร", desc: "ลงทะเบียนเข้าใช้งาน", Icon: Users },
                            { title: "รับ Passport", desc: "พาสปอร์ตดิจิทัลทันที", Icon: GraduationCap },
                            { title: "สแกนสะสมตรา", desc: "สแกน QR ตามจุดกิจกรรม", Icon: QrCode },
                            { title: "ดูสถิติ", desc: "สรุปการเข้าร่วมเรียลไทม์", Icon: BarChart3 },
                        ].map(({ title, desc, Icon }) => (
                            <VStack
                                key={title}
                                bg={cardBg}
                                border="1px solid"
                                borderColor={borderColor}
                                rounded="2xl"
                                p={6}
                                shadow="md"
                                spacing={4}
                            >
                                <Box
                                    bg={`${PRIMARY}15`}
                                    color={PRIMARY}
                                    rounded="xl"
                                    p={3}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon size={28} />
                                </Box>
                                <Heading size="md">{title}</Heading>
                                <Text color={textColor}>{desc}</Text>
                            </VStack>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box> */}

            {/* ===== FEATURES ===== */}
            {/* <Box as="section" id="features" py={20} px={6} bg={useColorModeValue("orange.50", "gray.900")}>
                <Container maxW="7xl">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
                      
                        <VStack align="start" spacing={6}>
                            <Heading size="2xl">ฟีเจอร์เด่นที่ทีมงานรัก ผู้ใช้ชอบ</Heading>
                            <VStack align="start" spacing={4}>
                                {[
                                    {
                                        title: "สแกน QR เร็วมาก",
                                        desc: "ประมวลผลทันที ลดคิวสะสม ตอบสนองไวทั้งออนไลน์และออฟไลน์",
                                    },
                                    {
                                        title: "แดชบอร์ดเรียลไทม์",
                                        desc: "เห็นจำนวนผู้เข้าร่วม/ตราประทับแบบวินาทีต่อวินาที",
                                    },
                                    {
                                        title: "แผนที่กิจกรรมแบบ Interactive",
                                        desc: "ค้นหาคณะ จุดเล่นกิจกรรม และเส้นทางได้สะดวก",
                                    },
                                ].map((f) => (
                                    <Box
                                        key={f.title}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        rounded="2xl"
                                        p={5}
                                        bg={cardBg}
                                        shadow="sm"
                                    >
                                        <Text fontWeight="semibold">{f.title}</Text>
                                        <Text fontSize="sm" color={textColor}>
                                            {f.desc}
                                        </Text>
                                    </Box>
                                ))}
                            </VStack>
                        </VStack>

            
                        <Box
                            position="relative"
                            rounded="3xl"
                            shadow="lg"
                            bgGradient={`linear(to-tr, ${SECONDARY}40, ${PRIMARY}40)`}
                            p={4}
                        >
                            <Box
                                bg={cardBg}
                                rounded="2xl"
                                h="sm"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Text fontSize="lg" color={textColor}>
                                    [ Image Preview / Mockup ]
                                </Text>
                            </Box>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box> */}

            {/* ===== STATS ===== */}
            {/* <Box as="section" id="stats" py={20} px={6}>
                <Container maxW="6xl" textAlign="center">
                    <Heading size="2xl">ตัวเลขที่บอกคุณภาพ</Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mt={12}>
                        {[
                            { label: "นักเรียนที่ลงทะเบียน", value: "2,345" },
                            { label: "ตราประทับทั้งหมด", value: "12,890" },
                            { label: "คณะ/ภาควิชาเข้าร่วม", value: "15" },
                        ].map((s) => (
                            <VStack
                                key={s.label}
                                bg={cardBg}
                                rounded="2xl"
                                p={8}
                                shadow="sm"
                                border="1px solid"
                                borderColor={borderColor}
                            >
                                <Text fontSize="4xl" fontWeight="extrabold" color={PRIMARY}>
                                    {s.value}
                                </Text>
                                <Text color={textColor}>{s.label}</Text>
                            </VStack>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box> */}

            {/* ===== TESTIMONIALS ===== */}
            {/* <Box as="section" id="testimonials" py={20} px={6} bg={useColorModeValue("orange.50", "gray.800")}>
                <Container maxW="6xl" textAlign="center">
                    <Heading size="2xl">เสียงจากผู้ใช้</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={12}>
                        {[
                            {
                                quote: "ระบบนี้ช่วยให้ผมเข้าร่วมกิจกรรมได้ครบทุกคณะ ง่ายและรวดเร็วมากครับ",
                                name: "นักเรียน ม.6",
                            },
                            {
                                quote: "สะดวกมากในการดูจำนวนผู้เข้าร่วมและสถิติ ทำให้งานจัดการได้ราบรื่น",
                                name: "อาจารย์ผู้ดูแล",
                            },
                        ].map((t, i) => (
                            <Box
                                key={i}
                                bg={cardBg}
                                rounded="2xl"
                                p={6}
                                shadow="sm"
                                border="1px solid"
                                borderColor={borderColor}
                                textAlign="left"
                            >
                                <Text fontSize="2xl" color={PRIMARY}>
                                    “
                                </Text>
                                <Text color={textColor} fontStyle="italic">
                                    {t.quote}
                                </Text>
                                <Text mt={4} fontWeight="semibold">
                                    — {t.name}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box> */}

            {/* ===== FOOTER ===== */}
            <Box as="footer" py={10} px={6} bg={useColorModeValue("gray.900", "black")} color="gray.400">
                <Container maxW="7xl" fontSize={"sm"}>
                    <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center">
                        <Text>© {new Date().getFullYear()} King {"Mongkut's"} University of Technology Thonburi</Text>
                        <HStack spacing={6} mt={{ base: 4, md: 0 }}>
                            <Link href="#schedule">กำหนดการ</Link>
                            <Link href="#booth">บูธแนะนำหลักสูตร</Link>
                            {/* <Link href="#map">แผนที่</Link> */}
                        </HStack>
                    </Flex>
                </Container>
            </Box>
        </>
    );
}
