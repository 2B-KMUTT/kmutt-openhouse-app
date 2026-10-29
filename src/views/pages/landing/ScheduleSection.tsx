import {
    Box,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Text,
    Heading,
    VStack,
    HStack,
    Stack,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { Calendar, MapPin } from "lucide-react";
import ThirtyOctTable from "./Tables/ThirtyOctTable";

const ScheduleSection = () => {
    const badgeBg = useColorModeValue("orange.50", "whiteAlpha.100");
    const badgeBorder = useColorModeValue("orange.200", "orange.700");
    const badgeText = useColorModeValue("orange.900", "orange.100");

    return (
        <Box as="section" id="schedule" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }} maxW="7xl" mx="auto">
            <VStack spacing={4} textAlign="center" mb={{ base: 6, md: 10 }}>
                <Heading size={{ base: "lg", md: "xl" }} color="#FA4616">
                    กำหนดการจัดกิจกรรม KMUTT Open House
                </Heading>
                <Heading size={{ base: "xs", sm: "sm", md: "md" }} color="gray.500" fontWeight="normal">
                    เปิดเฮือน มจธ. เส้นทางค้นพบแรงบันดาลใจและกิจกรรมหลากหลาย ตลอดวัน
                </Heading>

                {/* Event Date & Location Info */}
                <Stack
                    direction={{ base: "column", sm: "row" }}
                    spacing={{ base: 2, sm: 4 }}
                    pt={2}
                    align="center"
                    justify="center"
                >
                    <HStack
                        bg={badgeBg}
                        border="1px solid"
                        borderColor={badgeBorder}
                        color={badgeText}
                        px={4}
                        py={2}
                        rounded="full"
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        shadow="xs"
                    >
                        <Icon as={Calendar} color="#FA4616" />
                        <Text>วันเสาร์ที่ 30 ตุลาคม 2569 เวลา 09.00 – 17.00 น.</Text>
                    </HStack>
                    <HStack
                        bg={badgeBg}
                        border="1px solid"
                        borderColor={badgeBorder}
                        color={badgeText}
                        px={4}
                        py={2}
                        rounded="full"
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        shadow="xs"
                    >
                        <Icon as={MapPin} color="#FA4616" />
                        <Text>ณ โรงแรมเพชรรัชต์การ์เด้น อ.เมือง จ.ร้อยเอ็ด</Text>
                    </HStack>
                </Stack>
            </VStack>

            <Tabs variant="enclosed" colorScheme="orange" isFitted>
                <TabList>
                    <Tab fontWeight="bold" fontSize={{ base: "xs", sm: "sm", md: "md" }}>
                        <Text display={{ base: "inline", md: "none" }}>ทั้งหมด</Text>
                        <Text display={{ base: "none", md: "inline" }}>กำหนดการตลอดวัน (09.00 – 17.00 น.)</Text>
                    </Tab>
                    <Tab fontWeight="bold" fontSize={{ base: "xs", sm: "sm", md: "md" }}>
                        <Text display={{ base: "inline", md: "none" }}>รอบเช้า</Text>
                        <Text display={{ base: "none", md: "inline" }}>รอบเช้า (09.00 – 12.00 น.)</Text>
                    </Tab>
                    <Tab fontWeight="bold" fontSize={{ base: "xs", sm: "sm", md: "md" }}>
                        <Text display={{ base: "inline", md: "none" }}>รอบบ่าย</Text>
                        <Text display={{ base: "none", md: "inline" }}>รอบบ่าย (13.00 – 17.00 น.)</Text>
                    </Tab>
                </TabList>


                <TabPanels>
                    {/* ---------------- ทั้งหมด ---------------- */}
                    <TabPanel px={0}>
                        <ThirtyOctTable filter="all" />
                    </TabPanel>

                    {/* ---------------- รอบเช้า ---------------- */}
                    <TabPanel px={0}>
                        <ThirtyOctTable filter="morning" />
                    </TabPanel>

                    {/* ---------------- รอบบ่าย ---------------- */}
                    <TabPanel px={0}>
                        <ThirtyOctTable filter="afternoon" />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export { ScheduleSection };
