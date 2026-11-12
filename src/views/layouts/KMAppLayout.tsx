import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Text,
    VStack,
    useBreakpointValue,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import KMLayout from "./KMLayout";
import { ReactNode, useEffect } from "react";
import KMSidebar from "@/components/Sidebar/KMSidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

type KMLayoutProps = {
    children: ReactNode;
    navigation?: string;
    superAdminOnly?: boolean;
};

export default function KMAppLayout({ children, navigation, superAdminOnly = false }: KMLayoutProps) {
    const showSidebar = useBreakpointValue({ base: false, md: true });
    const cardBg = useColorModeValue("white", "gray.700");
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();

    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN";

    useEffect(() => {
        if (status === "loading") return;
        if (superAdminOnly && !isSuperAdmin) {
            toast({
                title: "ไม่มีสิทธิ์เข้าถึง",
                description: "เฉพาะ Super Admin เท่านั้นที่มีสิทธิ์จัดการส่วนนี้",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            router.replace("/_km/dashboard");
        }
    }, [superAdminOnly, isSuperAdmin, status, router, toast]);

    // If page is superAdminOnly and user is not superadmin
    if (superAdminOnly && (!session || !isSuperAdmin)) {
        return (
            <KMLayout>
                <Container maxW="7xl" px={{ base: 3, md: 4 }} py={6} mt="-10">
                    <Flex direction={{ base: "column", md: "row" }} gap={6} align="flex-start">
                        {showSidebar && <KMSidebar />}
                        <Flex direction="column" flex="1" gap={6} minW={0} w="full">
                            <Box
                                bg={cardBg}
                                p={{ base: 6, sm: 8 }}
                                rounded="2xl"
                                shadow="lg"
                                flex="1"
                                textAlign="center"
                            >
                                <VStack spacing={4} py={10}>
                                    <Text fontSize="3xl">🔒</Text>
                                    <Text fontSize="xl" fontWeight="bold" color="red.500">
                                        เฉพาะ Super Admin เท่านั้นที่มีสิทธิ์เข้าถึงหน้านี้
                                    </Text>
                                    <Text fontSize="sm" color="gray.500" maxW="md">
                                        ระบบจัดการหน้าแรก (Banner, ข้อความ, กำหนดการ, บูท) ถูกจำกัดสิทธิ์เฉพาะผู้ดูแลระบบระดับ Super Admin เท่านั้น
                                    </Text>
                                    <Button
                                        colorScheme="orange"
                                        size="md"
                                        rounded="xl"
                                        onClick={() => router.push("/_km/dashboard")}
                                    >
                                        กลับไปยังหน้าแดชบอร์ด
                                    </Button>
                                </VStack>
                            </Box>
                        </Flex>
                    </Flex>
                </Container>
            </KMLayout>
        );
    }

    return (
        <KMLayout>
            <Container maxW="7xl" px={{ base: 3, md: 4 }} py={6} mt="-10">
                <Flex direction={{ base: "column", md: "row" }} gap={6} align="flex-start">
                    {/* Sidebar */}
                    {showSidebar && <KMSidebar />}

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
        </KMLayout>
    );
}

