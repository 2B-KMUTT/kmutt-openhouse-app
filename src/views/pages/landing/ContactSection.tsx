import { useState, useEffect } from "react";
import { Box, Text, Button, HStack, useColorModeValue } from "@chakra-ui/react";
import { FaLine } from "react-icons/fa";

const PRIMARY = "#FA4616"; // KMUTT Orange Red
const SECONDARY = "#FFC233"; // KMUTT Yellow

const ContactSection = () => {
    const text = useColorModeValue("gray.800", "gray.200");

    const [coordinatorName, setCoordinatorName] = useState("นางสาวสุวะรักษ์ ศิริวรรณ์");
    const [coordinatorPhone, setCoordinatorPhone] = useState("0 2470 8471");
    const [coordinatorEmail, setCoordinatorEmail] = useState("admission@kmutt.ac.th");
    const [openChatLink, setOpenChatLink] = useState("https://kmutt.me/OpenChatOPH2025");

    useEffect(() => {
        fetch("/api/landing/config")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load config");
                return res.json();
            })
            .then((data) => {
                if (data.coordinatorName) setCoordinatorName(data.coordinatorName);
                if (data.coordinatorPhone) setCoordinatorPhone(data.coordinatorPhone);
                if (data.coordinatorEmail) setCoordinatorEmail(data.coordinatorEmail);
                if (data.openChatLink) setOpenChatLink(data.openChatLink);
            })
            .catch((err) => {
                console.error("Using default contact info due to fetch error:", err);
            });
    }, []);

    return (
        <Box id="contact" position="relative" overflow="hidden" py={{ base: 10, md: 16 }} px={{ base: 4, md: 12 }}>
            {/* Background Circles + Gradient */}
            <Box position="absolute" inset="0" zIndex={0} overflow="hidden">
                <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                    <defs>
                        <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                        </radialGradient>
                        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={SECONDARY} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={SECONDARY} stopOpacity={0} />
                        </radialGradient>
                    </defs>
                    <circle cx="20%" cy="30%" r="250" fill="url(#grad1)" />
                    <circle cx="80%" cy="70%" r="200" fill="url(#grad2)" />
                    <circle cx="50%" cy="50%" r="180" fill={`${PRIMARY}10`} />
                </svg>
            </Box>

            {/* Content */}
            <Box position="relative" zIndex={1} textAlign="center">
                <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" mb={4} color={PRIMARY}>
                    ช่องทางการติดต่อ & สอบถามข้อมูล
                </Text>

                <Text fontSize={{ base: "md", md: "lg" }} mb={2} maxW="700px" mx="auto" color={text}>
                    ผู้ประสานงาน: {coordinatorName}
                </Text>
                <Text fontSize={{ base: "sm", md: "md" }} mb={6} color={text}>
                    โทร. {coordinatorPhone} | อีเมล: {coordinatorEmail}
                </Text>

                <HStack justify="center" spacing={4} wrap="wrap">
                    <Button
                        as="a"
                        href={openChatLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="lg"
                        colorScheme="green"
                        leftIcon={<FaLine />}
                        px={8}
                        py={6}
                        borderRadius="full"
                        fontSize="md"
                        fontWeight="bold"
                        _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
                    >
                        Line OpenChat
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default ContactSection;
