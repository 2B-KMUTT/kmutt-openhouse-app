import React from "react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box,
    Text,
    Badge,
    VStack,
    HStack,
    List,
    ListItem,
    ListIcon,
    TableContainer,
    useColorModeValue,
} from "@chakra-ui/react";
import { Clock, CheckCircle2, Coffee } from "lucide-react";

interface ScheduleItem {
    time: string;
    session: "morning" | "break" | "afternoon";
    category: string;
    categoryColor: string;
    title: string;
    details?: string[];
    subSection?: {
        title: string;
        items: string[];
    };
    isBreak?: boolean;
}

const scheduleData: ScheduleItem[] = [
    {
        time: "09.00 – 09.30 น.",
        session: "morning",
        category: "ลงทะเบียน (รอบเช้า)",
        categoryColor: "blue",
        title: "ลงทะเบียนเข้าร่วมกิจกรรม (รอบเช้า)",
    },
    {
        time: "09.30 – 11.00 น.",
        session: "morning",
        category: "เวทีหลัก",
        categoryColor: "orange",
        title: "เวทีหลัก:",
        details: [
            "รับชมวิดีทัศน์แนะนำ มจธ.",
            "กิจกรรมแลกเปลี่ยน “ทำไมต้อง มจธ. /TCAS70 กับรอบการรับสมัคร และทุนการศึกษา”",
            "บรรยายพิเศษ/แนะนำหลักสูตร โดยคณาจารย์จากคณะต่าง ๆ",
        ],
    },
    {
        time: "11.00 – 12.00 น.",
        session: "morning",
        category: "ถาม - ตอบ & กิจกรรม",
        categoryColor: "purple",
        title: "ถาม - ตอบ พร้อมรับของที่ระลึก (เกมพันธุ์แท้ มจธ.)",
        subSection: {
            title: "กิจกรรมภายในงาน มีทั้งหมด 3 โซน",
            items: [
                "Admission Consult & Portfolio Clinic",
                "บูทคณะต่าง ๆ (ให้ข้อมูลหลักสูตรและคัดเลือกแฟ้มสะสมผลงาน)",
                "การทำเจลาโต",
            ],
        },
    },
    {
        time: "12.00 – 13.00 น.",
        session: "break",
        category: "พักกลางวัน",
        categoryColor: "gray",
        title: "พักกลางวัน",
        isBreak: true,
    },
    {
        time: "13.00 – 13.30 น.",
        session: "afternoon",
        category: "ลงทะเบียน (รอบบ่าย)",
        categoryColor: "blue",
        title: "ลงทะเบียนเข้าร่วมกิจกรรม (รอบบ่าย)",
    },
    {
        time: "13.30 – 15.00 น.",
        session: "afternoon",
        category: "เวทีหลัก",
        categoryColor: "orange",
        title: "เวทีหลัก:",
        details: [
            "รับชมวิดีทัศน์แนะนำ มจธ.",
            "กิจกรรมแลกเปลี่ยน “ทำไมต้อง มจธ. /TCAS70 กับรอบการรับสมัคร และทุนการศึกษา”",
            "บรรยายพิเศษ/แนะนำหลักสูตร โดยคณาจารย์จากคณะต่าง ๆ",
        ],
    },
    {
        time: "15.00 – 16.00 น.",
        session: "afternoon",
        category: "ถาม - ตอบ & กิจกรรม",
        categoryColor: "purple",
        title: "ถาม - ตอบ พร้อมรับของที่ระลึก (เกมพันธุ์แท้ มจธ.)",
        subSection: {
            title: "กิจกรรมภายในงาน มีทั้งหมด 3 โซน",
            items: [
                "Admission Consult & Portfolio Clinic",
                "บูทคณะต่าง ๆ (ให้ข้อมูลหลักสูตรและคัดเลือกแฟ้มสะสมผลงาน)",
                "การทำเจลาโต",
            ],
        },
    },
];

interface ThirtyOctTableProps {
    filter?: "all" | "morning" | "afternoon";
}

const ThirtyOctTable: React.FC<ThirtyOctTableProps> = ({ filter = "all" }) => {
    const tableBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headBg = useColorModeValue("orange.50", "whiteAlpha.100");
    const breakBg = useColorModeValue("amber.50", "whiteAlpha.50");
    const hoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.600", "gray.300");

    const filteredData = scheduleData.filter((item) => {
        if (filter === "morning") return item.session === "morning";
        if (filter === "afternoon") return item.session === "afternoon";
        return true;
    });

    return (
        <Box
            bg={tableBg}
            border="1px solid"
            borderColor={borderColor}
            rounded="2xl"
            shadow="sm"
            overflow="hidden"
            my={4}
        >
            <TableContainer>
                <Table variant="simple" size="md">
                    <Thead bg={headBg}>
                        <Tr>
                            <Th
                                color="#F04E23"
                                fontSize="sm"
                                py={4}
                                width={{ base: "35%", md: "25%" }}
                                textTransform="none"
                                letterSpacing="normal"
                            >
                                <HStack spacing={2}>
                                    <Clock size={16} />
                                    <Text fontWeight="bold">เวลา</Text>
                                </HStack>
                            </Th>
                            <Th
                                color="#F04E23"
                                fontSize="sm"
                                py={4}
                                textTransform="none"
                                letterSpacing="normal"
                            >
                                <Text fontWeight="bold">กิจกรรม</Text>
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredData.map((item, index) => (
                            <Tr
                                key={index}
                                bg={item.isBreak ? breakBg : undefined}
                                _hover={{ bg: hoverBg }}
                                transition="background-color 0.2s ease"
                            >
                                <Td
                                    verticalAlign="top"
                                    py={5}
                                    px={{ base: 3, md: 6 }}
                                    borderColor={borderColor}
                                >
                                    <VStack align="flex-start" spacing={1.5}>
                                        <Text
                                            fontWeight="bold"
                                            fontSize={{ base: "xs", sm: "sm", md: "md" }}
                                            color="#F04E23"
                                            whiteSpace="nowrap"
                                        >
                                            {item.time}
                                        </Text>
                                        <Badge
                                            colorScheme={item.categoryColor}
                                            variant="subtle"
                                            rounded="md"
                                            px={2}
                                            py={0.5}
                                            fontSize="xs"
                                        >
                                            {item.category}
                                        </Badge>
                                    </VStack>
                                </Td>

                                <Td
                                    verticalAlign="top"
                                    py={5}
                                    px={{ base: 3, md: 6 }}
                                    borderColor={borderColor}
                                >
                                    {item.isBreak ? (
                                        <HStack spacing={2} color="gray.600" _dark={{ color: "gray.300" }}>
                                            <Coffee size={18} />
                                            <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                                                {item.title}
                                            </Text>
                                        </HStack>
                                    ) : (
                                        <VStack align="flex-start" spacing={3}>
                                            <Text
                                                fontWeight="bold"
                                                fontSize={{ base: "sm", md: "md" }}
                                                color={textColor}
                                            >
                                                {item.title}
                                            </Text>

                                            {item.details && item.details.length > 0 && (
                                                <List spacing={2} pl={{ base: 1, md: 2 }}>
                                                    {item.details.map((detail, dIdx) => (
                                                        <ListItem
                                                            key={dIdx}
                                                            display="flex"
                                                            alignItems="flex-start"
                                                            fontSize={{ base: "xs", sm: "sm" }}
                                                            color={subTextColor}
                                                            lineHeight="1.6"
                                                        >
                                                            <ListIcon
                                                                as={CheckCircle2}
                                                                color="#F04E23"
                                                                mt="3px"
                                                                boxSize="14px"
                                                            />
                                                            <Text>{detail}</Text>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            )}

                                            {item.subSection && (
                                                <Box
                                                    mt={2}
                                                    p={3}
                                                    bg={useColorModeValue("orange.50", "whiteAlpha.50")}
                                                    rounded="xl"
                                                    border="1px dashed"
                                                    borderColor={useColorModeValue("orange.200", "orange.700")}
                                                    w="100%"
                                                >
                                                    <Text
                                                        fontWeight="semibold"
                                                        fontSize={{ base: "xs", sm: "sm" }}
                                                        color="#F04E23"
                                                        mb={2}
                                                    >
                                                        {item.subSection.title}
                                                    </Text>
                                                    <List spacing={1.5} pl={2}>
                                                        {item.subSection.items.map((zone, zIdx) => (
                                                            <ListItem
                                                                key={zIdx}
                                                                display="flex"
                                                                alignItems="center"
                                                                fontSize={{ base: "xs", sm: "sm" }}
                                                                color={subTextColor}
                                                            >
                                                                <Text mr={2} color="#F04E23" fontWeight="bold">
                                                                    •
                                                                </Text>
                                                                <Text>{zone}</Text>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>
                                            )}
                                        </VStack>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ThirtyOctTable;
