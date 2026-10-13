"use client";

import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    HStack,
    VStack,
    IconButton,
    Container,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { LandingSections } from "./LandingSection";
import { ScheduleSection } from "./ScheduleSection";
import BoothSection from "./BoothSection";
import MapSection from "./MapSection";
import { IoCalendar, IoLogIn } from "react-icons/io5";
import BannerSection from "./BannerSection";
import Head from "next/head";
import Image from "next/image";
import ContactSection from "./ContactSection";
import StatSection from "./StatSection";
import { useSession } from "next-auth/react";
import FAQSection from "./FAQSection";

const PRIMARY = "#F04E23"; // KMUTT Orange Red
const SECONDARY = "#FFC233"; // KMUTT Yellow

const LandingPage = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { colorMode, toggleColorMode } = useColorMode();

    const bg = useColorModeValue("white", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const navBg = useColorModeValue("whiteAlpha.85", "gray.800");
    const borderColor = useColorModeValue("orange.100", "gray.700");
    const { status } = useSession();

    return (
        <>
            <Head>
                <title>เปิดเฮือน มจธ. - KMUTT Open House 2569 (มดอีสาน)</title>
                <meta
                    name="description"
                    content="เปิดเฮือน มจธ. KMUTT Open House (มดอีสาน) | วันที่ 30 ตุลาคม 2569 ณ โรงแรมเพชรรัชต์การ์เด้น จ.ร้อยเอ็ด"
                />
                <meta property="og:title" content="เปิดเฮือน มจธ. - KMUTT Open House 2569 (มดอีสาน)" />
                <meta property="og:description" content="เปิดเฮือน มจธ. วันที่ 30 ตุลาคม 2569 ณ โรงแรมเพชรรัชต์การ์เด้น จ.ร้อยเอ็ด" />
                <meta property="og:image" content="/images/banner_new.png" />
            </Head>
            <Box minH="100vh" bg={useColorModeValue("white", "gray.900")} color={textColor}>
                {/* ===== NAVBAR ===== */}
                <Box as="header" position="sticky" top="0" zIndex="50" w="full" px={0}>
                    <Container maxW="7xl" py={4}>
                        <Flex
                            bg={navBg}
                            backdropFilter="blur(12px)"
                            border="1px solid"
                            borderColor={borderColor}
                            rounded="2xl"
                            shadow="sm"
                            px={6}
                            h="16"
                            align="center"
                        >
                            {/* Logo */}
                            <HStack spacing={3} flex="1">

                                {/* <Box w={8} h={8} rounded="xl" bg={PRIMARY} /> */}
                                <Image src="/images/logo.jpg" style={{ borderRadius: "12px" }} alt="KMUTT Logo" width={32} height={32} />
                                <Link href="/" aria-label="KMUTT Open House">
                                    <Text fontWeight="bold" display={{ base: "block", md: "none" }} lineHeight={{ base: "20px" }} fontSize={{ base: "sm", md: "md" }} color={PRIMARY}>
                                        KMUTT <br /> Open House
                                    </Text>
                                    <Text fontWeight="bold" display={{ base: "none", md: "block" }} fontSize={{ base: "sm", md: "md" }} color={PRIMARY}>
                                        KMUTT Open House
                                    </Text>
                                </Link>
                            </HStack>

                            {/* Desktop nav */}
                            <HStack
                                as="nav"
                                spacing={8}
                                display={{ base: "none", md: "flex" }}
                                fontSize="sm"
                                fontWeight="medium"
                                justify="center"
                                flex="1"
                                lineHeight={"20px"}
                                align={"center"}

                            >
                                {/* <Link href="#how">วิธีใช้งาน</Link> */}
                                <Link href="#schedule"><center>กำหนดการ <br />Schedule</center></Link>
                                <Link href="#booth"><center>บูธแนะนำหลักสูตร <br />Program Information Booth</center></Link>
                                <Link href="#map"><center>แผนที่ <br />Map</center></Link>
                                {/* <Link href="#features">ฟีเจอร์</Link>
                            <Link href="#stats">สถิติ</Link>
                            <Link href="#testimonials">เสียงจากผู้ใช้</Link> */}
                            </HStack>


                            {/* Right side buttons */}
                            <HStack spacing={2} flex="1" justify="flex-end">
                                {/* Dark Mode Toggle */}
                                <IconButton
                                    aria-label="Toggle Dark Mode"
                                    icon={colorMode === "light" ? <Moon /> : <Sun />}
                                    onClick={toggleColorMode}
                                    variant="ghost"
                                />
                                {status === "authenticated" ? <Button
                                    as={Link}
                                    href="/app/dashboard"
                                    bg={PRIMARY}
                                    _hover={{ bg: "#d6451f" }}
                                    color="white"
                                    rounded="xl"
                                    display={{ base: "none", md: "inline-flex" }}
                                >
                                    ไปที่แดชบอร์ด
                                </Button> : <Button
                                    as={Link}
                                    href="/login"
                                    bg={PRIMARY}
                                    _hover={{ bg: "#d6451f" }}
                                    color="white"
                                    rounded="xl"
                                    display={{ base: "none", md: "inline-flex" }}
                                >
                                    เข้าสู่ระบบ
                                </Button>}

                                {/* Desktop login */}
                                {/* <Box display={{ base: "none", md: "block" }}>
                                
                            </Box> */}



                                {/* Mobile Hamburger */}
                                <Box display={{ base: "block", md: "none" }} >
                                    <IconButton
                                        aria-label="Toggle Menu"
                                        icon={menuOpen ? <X /> : <Menu />}
                                        onClick={() => setMenuOpen(!menuOpen)}
                                        color={PRIMARY}
                                        variant="ghost"
                                    />
                                </Box>
                            </HStack>
                        </Flex>

                        {/* Mobile dropdown menu */}
                        {menuOpen && (
                            <Box
                                mt={2}
                                rounded="2xl"
                                border="1px solid"
                                borderColor={borderColor}
                                bg={bg}
                                shadow="md"
                                px={6}
                                py={4}
                                fontSize={"sm"}
                            >
                                <VStack align="stretch" spacing={4}>
                                    {/* <Link href="#how" onClick={() => setMenuOpen(false)}>
                                    วิธีใช้งาน
                                </Link> */}
                                    <Link href="#schedule" onClick={() => setMenuOpen(false)}>
                                        {"> "}      กำหนดการ / Schedule
                                    </Link>
                                    {/* บูธแนะนำหลักสูตร & หน่วยงาน */}
                                    <Link href="#booth" onClick={() => setMenuOpen(false)}>
                                        {"> "} บูธแนะนำหลักสูตร & หน่วยงาน / Program Information Booth
                                    </Link>
                                    {/* แผนที่ */}
                                    <Link href="#map" onClick={() => setMenuOpen(false)}>
                                        {"> "} แผนที่ / Map
                                    </Link>
                                    {/* <Link href="#features" onClick={() => setMenuOpen(false)}>
                                    ฟีเจอร์
                                </Link>
                                <Link href="#stats" onClick={() => setMenuOpen(false)}>
                                    สถิติ
                                </Link>
                                <Link href="#testimonials" onClick={() => setMenuOpen(false)}>
                                    เสียงจากผู้ใช้
                                </Link>*/}
                                    {status === "authenticated" ? <Button
                                        as={Link}
                                        href="/app/dashboard"
                                        w="full"
                                        bg={PRIMARY}
                                        _hover={{ bg: "#d6451f" }}
                                        color="white"
                                        rounded="xl"
                                    >
                                        ไปที่แดชบอร์ด
                                    </Button> : <Button
                                        as={Link}
                                        href="/login"
                                        w="full"
                                        bg={PRIMARY}
                                        _hover={{ bg: "#d6451f" }}
                                        color="white"
                                        rounded="xl"
                                    >
                                        เข้าสู่ระบบ
                                    </Button>}

                                </VStack>
                            </Box>
                        )}
                    </Container>
                </Box>

                {/* ===== HERO ===== */}
                <Flex
                    mt={"-20vh"}
                    as="section"
                    minH="110vh"
                    align="center"
                    justify="center"
                    overflow="hidden"
                    bgGradient={useColorModeValue(
                        `linear(to-br, white, ${SECONDARY}20)`,
                        `linear(to-br, gray.900, ${PRIMARY}20)`
                    )}
                    position="relative"
                >
                    {/* Background Circles */}
                    <Box position="absolute" inset="0" zIndex={0}>
                        <svg width="100%" height="100%">
                            <circle cx="20%" cy="30%" r="250" fill={`${PRIMARY}20`} />
                            <circle cx="80%" cy="70%" r="200" fill={`${SECONDARY}25`} />
                        </svg>
                    </Box>

                    <VStack zIndex={1} mt="20" textAlign="center" spacing={6} px={6} maxW="4xl">
                        <Heading size={{ base: "md", md: "4xl" }} fontWeight="extrabold" color={textColor}>
                            <Text as="span" color={PRIMARY}>
                                KMUTT OPEN HOUSE <br />
                            </Text> {" "}
                            เปิดเฮือน มจธ. (มดอีสาน)
                        </Heading>
                        <Text px={6} fontSize={{ base: "md", md: "lg" }} lineHeight={{ base: "25px", md: "32px" }} color={textColor}>
                            วันที่ 30 ตุลาคม 2569 เวลา 09.00 – 16.00 น. <br />
                            ณ โรงแรมเพชรรัชต์การ์เด้น อ.เมือง จ.ร้อยเอ็ด
                        </Text>

                        <Text px={6} fontSize={{ base: "sm", md: "md" }} lineHeight={{ base: "25px", md: "32px" }} color={textColor}>
                            October 30, 2026, from 09:00 a.m. to 4:00 p.m. <br />
                            at Petcharat Garden Hotel, Mueang, Roi Et
                        </Text>



                        <HStack spacing={4} pt={4} flexWrap="wrap" justify="center">
                            <Button
                                as={Link}
                                href="#schedule"
                                size={{ base: "md", md: "lg" }}
                                variant="outline"
                                borderColor={PRIMARY}
                                color={PRIMARY}
                                _hover={{ bg: `${SECONDARY}30` }}
                                rounded="xl"
                                px={8}
                            >
                                <Flex justify={"center"} align="center">
                                    <IoCalendar style={{ marginRight: "8px" }} />
                                    <Text>กำหนดการ / Schedule</Text>
                                </Flex>

                            </Button>

                            <Button
                                as={Link}
                                href="/register"
                                size={{ base: "md", md: "lg" }}
                                bg={PRIMARY}
                                _hover={{ bg: "#d6451f" }}
                                color="white"
                                rounded="xl"
                                px={8}
                            >
                                <Flex justify={"center"} align="center">
                                    <IoLogIn style={{ marginRight: "8px" }} />
                                    <Text>ลงทะเบียน / Register</Text>
                                </Flex>

                            </Button>
                            {/* <Button
                            as={Link}
                            href="/register"
                            size={{ base: "md", md: "lg" }}
                            variant="outline"
                            borderColor={PRIMARY}
                            color={PRIMARY}
                            _hover={{ bg: `${SECONDARY}30` }}
                            rounded="xl"
                            px={8}
                        >
                            ลงทะเบียน
                        </Button> */}
                        </HStack>
                    </VStack>
                </Flex>
                {/* ===== SCHEDULE ===== */}
                <BannerSection />
                <ScheduleSection />
                <BoothSection />

                <MapSection />
                <ContactSection />
                <StatSection />
                <FAQSection />
                {/* ===== OTHER SECTIONS ===== */}
                <LandingSections />

            </Box >
        </>
    );
};

export { LandingPage }