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
import { ReactNode, useState } from "react";
import LogoutButton from "@/components/Auth/LogoutButton";

const PRIMARY = "#F04E23"; // KMUTT Orange Red
const SECONDARY = "#FFC233"; // KMUTT Yellow

type StudentLayoutProps = {
    children: ReactNode
}

export default function GuestLayout({ children }: StudentLayoutProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { colorMode, toggleColorMode } = useColorMode();

    const bg = useColorModeValue("white", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const navBg = useColorModeValue("whiteAlpha.85", "gray.800");
    const borderColor = useColorModeValue("orange.100", "gray.700");

    const svgOpacity = colorMode === "light" ? 0.1 : 0.2;

    return (
        <Box minH={"100vh"} bg={bg} color={textColor} position="relative" overflow="hidden">
            {/* ===== SVG Background ===== */}
            <Box
                position="absolute"
                inset={0}
                zIndex={1}
                pointerEvents="none"
            >
                <svg width="100%" height="100%" preserveAspectRatio="none">
                    <circle cx="20%" cy="30%" r="250" fill={`${PRIMARY}`} opacity={svgOpacity} />
                    <circle cx="80%" cy="70%" r="300" fill={`${SECONDARY}`} opacity={svgOpacity} />
                    <circle cx="50%" cy="50%" r="150" fill={`${PRIMARY}`} opacity={svgOpacity * 0.5} />
                </svg>
            </Box>
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
                        justify="space-between"
                    >
                        {/* Logo */}
                        <HStack spacing={3}>
                            <Box w={8} h={8} rounded="xl" bg={PRIMARY} />
                            <Link href="/" aria-label="KMUTT Open House">
                                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} color={PRIMARY}>
                                    KMUTT Open House
                                </Text>
                            </Link>
                        </HStack>

                        {/* Right side buttons */}
                        <HStack spacing={2}>
                            {/* Dark Mode Toggle */}
                            <IconButton
                                aria-label="Toggle Dark Mode"
                                icon={colorMode === "light" ? <Moon /> : <Sun />}
                                onClick={toggleColorMode}
                                variant="ghost"
                            />

                            {/* Desktop logout */}
                            <Box display={{ base: "none", md: "block" }}>
                                <LogoutButton
                                    bg={PRIMARY}
                                    _hover={{ bg: "#d6451f" }}
                                    color="white"
                                    rounded="xl"
                                >
                                    ออกจากระบบ
                                </LogoutButton>
                            </Box>

                            {/* Mobile Hamburger */}
                            <Box display={{ base: "block", md: "none" }}>
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
                        >
                            <VStack align="stretch" spacing={4}>
                                <Link href="/#schedule" onClick={() => setMenuOpen(false)}>
                                    {"> "}  กำหนดการ / Schedule
                                </Link>

                                <LogoutButton
                                    w="full"
                                    size={{ base: "sm", md: "md" }}
                                    bg={PRIMARY}
                                    _hover={{ bg: "#d6451f" }}
                                    color="white"
                                    rounded="xl"
                                    fontSize={{ base: "sm", md: "md" }}
                                >
                                    ออกจากระบบ
                                </LogoutButton>
                            </VStack>
                        </Box>
                    )}
                </Container>
            </Box>
            {/* ===== END NAVBAR ===== */}
            {/* Main content */}
            <Box as="main" minH="80vh" py={10} position="relative" zIndex={1}>

                {children}
            </Box>
        </Box>
    );
};
