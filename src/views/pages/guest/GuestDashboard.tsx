"use client"

import { useEffect, useState } from "react"
import GuestLayout from "@/views/layouts/GuestLayout"
import {
    Box,
    Flex,
    Heading,
    Text,
    Avatar,
    AvatarBadge,
    Badge,
    VStack,
    HStack,
    useBreakpointValue,
    Button,
    Container,
    useColorModeValue,
    Icon,
} from "@chakra-ui/react"
import StudentSidebar from "@/components/Sidebar/StudentSidebar"
import { ScheduleSection } from "../landing/ScheduleSection"
import { FaClipboardList } from "react-icons/fa"
import { useRouter } from "next/router"
import SurveyModal from "@/components/Modal/SurveyModal"

const PRIMARY = "#FA4616"
const SECONDARY = "#FFC233"

type CheckIn = {
    facultyName: string
    checkInPoint: string
    timestamp: string
}

type StudentProfile = {
    first_name: string
    last_name: string
    school: string
    province: string
    email: string
    phone: string
    checkIns: CheckIn[]
}

const GuestDashboardPage = () => {
    const router = useRouter();
    const [data, setData] = useState<StudentProfile | null>(null)
    const showSidebar = useBreakpointValue({ base: false, md: true })

    const bgColor = useColorModeValue("gray.50", "gray.800")
    const cardBg = useColorModeValue("white", "gray.700")
    const sidebarBg = useColorModeValue("gray.100", "gray.900")
    const textColor = useColorModeValue("gray.800", "gray.100")

    useEffect(() => {
        fetch("/api/guest/profile")
            .then((res) => res.json())
            .then((d) => setData(d))
    }, [])

    if (!data) {
        return (
            <GuestLayout>
                <Flex justify="center" align="center" minH="60vh">
                    <Text>กำลังโหลดข้อมูล...</Text>
                </Flex>
            </GuestLayout>
        )
    }

    return (
        <GuestLayout>
            {/* ✅ Popup Survey Modal */}
            <SurveyModal />
            <Container maxW="7xl" px={4} py={6} mt="-10">
                <Flex direction={{ base: "column", md: "row" }} gap={6}>
                    {/* Sidebar */}
                    {/* {showSidebar && (
                        <StudentSidebar />
                    )} */}

                    {/* Content */}
                    <Box flex="1" >
                        {/* Profile Card */}
                        <Box
                            mt={{ base: -4, md: 0 }}
                            bg={cardBg}
                            p={{ base: 4, md: 6 }}
                            rounded="2xl"
                            shadow="lg"
                            mb={6}
                            borderLeft={`5px solid ${PRIMARY}`}
                        >
                            <Flex align="center" justify="space-between" wrap="wrap">
                                <HStack spacing={5}>
                                    <Avatar
                                        name={data.first_name}
                                        size={{ base: "md", md: "xl" }}
                                        bg={PRIMARY}
                                        color="white"
                                    >
                                        <AvatarBadge boxSize={{ base: "1em", md: "1.2em" }} bg="green.400" />
                                    </Avatar>
                                    <VStack align="start" spacing={1} lineHeight={{ base: "12px", md: "base" }}>
                                        <Heading size={{ base: "sm", md: "md" }} color={textColor}>
                                            {data.first_name} {data.last_name}
                                        </Heading>
                                        <Text color={textColor} fontSize={{ base: "xs", md: "sm" }}>
                                            {data.school} • {data.province}
                                        </Text>
                                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                                            {data.email}
                                        </Text>
                                    </VStack>
                                </HStack>

                            </Flex>
                        </Box>


                        <Box
                            mt={-2}
                            // bg={cardBg}
                            // p={{ base: 4, md: 6 }}
                            rounded="2xl"
                            shadow="lg"
                            bg={cardBg}
                        // borderLeft={`5px solid ${SECONDARY}`}
                        >
                            <Box
                                onClick={() => router.push("/survey")}
                                bgGradient="linear(to-r, orange.400, orange.500)"
                                _hover={{
                                    bgGradient: "linear(to-r, orange.500, orange.600)",
                                    transform: "scale(1.05)",
                                    boxShadow: "lg",
                                }}
                                transition="all 0.2s"
                                w="100%"
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
                                        เปิดเฮือน มจธ. (มดอีสาน)
                                    </Text>
                                </Flex>
                            </Box>
                            <ScheduleSection /> </Box>

                    </Box>
                </Flex>
            </Container>
        </GuestLayout>
    )
}

export { GuestDashboardPage }
