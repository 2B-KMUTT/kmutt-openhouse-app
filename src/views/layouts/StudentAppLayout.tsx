import { Box, Container, Divider, Flex, Text, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react"
import StudentSidebar from "@/components/Sidebar/StudentSidebar";
import StudentLayout from "./StudentLayout";
type StudentLayoutProps = {
    children: ReactNode;
    navigation?: string
}

export default function StudentAppLayout({ children, navigation }: StudentLayoutProps) {
    const showSidebar = useBreakpointValue({ base: false, md: true })
    const cardBg = useColorModeValue("white", "gray.700")

    return (
        <StudentLayout>
            <Container maxW="7xl" px={{ base: 3, md: 4 }} py={6} mt="-10">
                <Flex direction={{ base: "column", md: "row" }} gap={6} align="flex-start">
                    {/* Sidebar */}
                    {showSidebar && <StudentSidebar />}

                    <Flex direction="column" flex="1" gap={6} minW={0} w="full">
                        <Box
                            bg={cardBg}
                            p={{ base: 4, sm: 6 }}
                            rounded="2xl"
                            shadow="lg"
                            flex="1"
                            minW={0}
                            w="full"
                            overflow="hidden"
                        >
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Openhouse / {navigation}
                            </Text>
                            <Divider mt="-1" mb={6} />

                            {children}
                        </Box>
                    </Flex>
                </Flex>
            </Container>
        </StudentLayout>
    )
}

