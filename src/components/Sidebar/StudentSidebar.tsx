import {
    Box,
    VStack,
    Button,
    HStack,
    Flex,
    Text,
    useColorModeValue,
    Link,
} from "@chakra-ui/react"
import { label } from "framer-motion/client"
import {
    MdDashboard,
    MdQrCode,
    MdPerson,
    MdSettings,
    MdSearch,
    MdLogout,
} from "react-icons/md"
import { RiProfileFill } from "react-icons/ri";
import { GiJourney } from "react-icons/gi";
import { signOut } from "next-auth/react";

import { Icon } from "@chakra-ui/react"
import { FaClipboardList } from "react-icons/fa"

import { GrCertificate, GrSearch, GrWorkshop } from "react-icons/gr";
import { useRouter } from "next/router";

const StudentSidebar = () => {
    const PRIMARY = "#F04E23"
    const bgColor = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.200", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const router = useRouter()

    const menuItems = [
        { label: "Dashboard", icon: MdDashboard, link: "/app/dashboard" },
        // { label: "QR Code", icon: MdQrCode },
        { label: "โปรไฟล์", icon: RiProfileFill, link: "/app/profile" },
        { label: "My Passport", icon: MdQrCode, link: "/app/my-passport" },
        { label: "My Journey", icon: GiJourney, link: "/app/my-journey" },
        // { label: "ค้นหากิจกรรม", icon: MdSearch },
        { label: "ค้นหากิจกรรม", icon: GrSearch, link: "/app/activity-search" },
        { label: "กิจกรรมที่ลงทะเบียน", icon: GrWorkshop, link: "/app/activity-register" },
        // { label: "E-Certificate", icon: GrCertificate, link: "/app/e-certificate" },
        // { label: "Profile", icon: MdPerson },
        // { label: "Settings", icon: MdSettings },
        { label: "ออกจากระบบ", icon: MdLogout, isLogout: true },
    ]

    return (
        <Flex flexDir={"column"} gap={5}>
            <Box
                bg={bgColor}
                w="250px"
                p={5}
                rounded="2xl"
                h="fit-content"
                shadow="md"
                flexShrink={0}
            >
                <VStack align="stretch" spacing={3}>
                    {menuItems.map((item) => (
                        <Button
                            onClick={async () => {
                                if (item.isLogout) {
                                    await signOut({ redirect: false })
                                    window.location.href = "/login"
                                } else if (item.link) {
                                    router.push(item.link)
                                }
                            }}
                            key={item.label}
                            variant="ghost"
                            justifyContent="start"
                            _hover={{ bg: hoverBg }}
                            leftIcon={<item.icon />}
                            color={textColor}
                            fontWeight="medium"
                            size="md"
                            rounded="lg"
                        >
                            {item.label}
                        </Button>
                    ))}
                </VStack>
            </Box>
            {/* <Box
                onClick={() => router.push("/survey")}
                bgGradient="linear(to-r, orange.400, orange.500)"
                _hover={{
                    bgGradient: "linear(to-r, orange.500, orange.600)",
                    transform: "scale(1.05)",
                    boxShadow: "lg",
                }}
                transition="all 0.2s"
                w="260px"
                h="fit-content"
                p={6}
                rounded="2xl"
                shadow="md"
                cursor={"pointer"}
                flexShrink={0}
                textDecoration="none"
            >
                <Flex direction="column" align="center" justify="center" textAlign="center">
                    <Icon as={FaClipboardList} boxSize={8} color="white" mb={3} />
                    <Text fontWeight="bold" fontSize="lg" color="white">
                        ร่วมทำแบบสอบถาม
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.900" mt={-2}>
                        Open House 2025
                    </Text>
                </Flex>
            </Box> */}
        </Flex>
    )
}

export default StudentSidebar
