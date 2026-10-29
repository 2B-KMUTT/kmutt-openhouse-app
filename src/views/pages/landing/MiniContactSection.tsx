import { Box, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { FaLine } from "react-icons/fa";

const PRIMARY = "#FA4616"; // KMUTT Orange Red
const SECONDARY = "#FFC233"; // KMUTT Yellow

const ContactSection = () => {
    const text = useColorModeValue("gray.800", "gray.200");

    return (
        <Box id="contact" mt={2} position="relative" overflow="hidden" py={{ base: 10, md: 16 }} px={{ base: 4, md: 12 }} rounded={"xl"}>
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
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={2} color={PRIMARY}>
                    ช่องทางการติดต่อ
                </Text>

                <Text fontSize={{ base: "sm", md: "md" }} lineHeight={{ base: "short", md: "auto" }} mb={5} maxW="700px" mx="auto" color={text}>
                    หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม สามารถเข้าร่วม OpenChat ของเราได้ที่ลิงก์ด้านล่างนี้
                </Text>

                <Button
                    as="a"
                    href="https://kmutt.me/OpenChatOPH2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    size={{ base: "md", md: "md" }}
                    colorScheme="green"
                    leftIcon={<FaLine />}
                    px={8}
                    py={6}
                    borderRadius="full"
                    fontSize={{ base: "md", md: "md" }}
                    fontWeight="bold"
                    _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
                >
                    เข้าร่วม Line OpenChat
                </Button>
            </Box>
        </Box>
    );
};

export default ContactSection;
