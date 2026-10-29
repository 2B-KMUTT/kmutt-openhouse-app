import { Box, Container, Divider, Flex, Text, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import StaffLayout from "./StaffLayout";
import { ReactNode } from "react"

import StaffSidebar from "@/components/Sidebar/StaffSidebar";
type StaffLayoutProps = {
    children: ReactNode;
    navigation?: string
}

export default function StaffAppLayout({ children, navigation }: StaffLayoutProps) {
    const showSidebar = useBreakpointValue({ base: false, md: true })
    const cardBg = useColorModeValue("white", "gray.700")

    return (
        <StaffLayout>
            <Container maxW="7xl" px={{ base: 3, md: 4 }} py={6} mt="-10">
                <Flex direction={{ base: "column", md: "row" }} gap={6} align="flex-start">
                    {/* Sidebar */}
                    {showSidebar && <StaffSidebar />}

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
                                Admin / {navigation}
                            </Text>
                            <Divider mt="-1" mb={6} />

                            {children}
                        </Box>
                    </Flex>
                </Flex>
            </Container>
        </StaffLayout>
    )
}

