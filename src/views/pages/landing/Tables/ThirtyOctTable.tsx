import React, { useEffect, useState } from "react";
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
import { LandingScheduleItem } from "@/interfaces/LandingContent";

const defaultScheduleData: LandingScheduleItem[] = [
    {
        id: 1,
        time: "09.00 – 09.30 น.",
        session: "morning",
        category: "ลงทะเบียน (รอบเช้า)",
        categoryColor: "blue",
        title: "ลงทะเบียนเข้าร่วมกิจกรรม (รอบเช้า)",
        orderIndex: 1,
        display: true,
    },
    {
        id: 2,
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
        orderIndex: 2,
        display: true,
    },
    {
        id: 3,
        time: "11.00 – 12.00 น.",
        session: "morning",
        category: "ถาม - ตอบ & กิจกรรม",
        categoryColor: "purple",
        title: "ถาม - ตอบ พร้อมรับของที่ระลึก (เกมพันธุ์แท้ มจธ.)",
        subSectionTitle: "กิจกรรมภายในงาน มีทั้งหมด 3 โซน",
        subSectionItems: [
            "โซนที่ 1: Admission Consult & Portfolio Clinic",
            "โซนที่ 2: บูทคณะต่าง ๆ (ให้ข้อมูลหลักสูตรและคัดเลือกแฟ้มสะสมผลงาน)",
            "โซนที่ 3: KMUTT Industry Consultation Clinic (ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า - ทีม LISA)",
        ],
        orderIndex: 3,
        display: true,
    },
    {
        id: 4,
        time: "12.00 – 13.00 น.",
        session: "break",
        category: "พักกลางวัน",
        categoryColor: "gray",
        title: "พักกลางวัน",
        isBreak: true,
        orderIndex: 4,
        display: true,
    },
    {
        id: 5,
        time: "13.00 – 13.30 น.",
        session: "afternoon",
        category: "ลงทะเบียน (รอบบ่าย)",
        categoryColor: "blue",
        title: "ลงทะเบียนเข้าร่วมกิจกรรม (รอบบ่าย)",
        orderIndex: 5,
        display: true,
    },
    {
        id: 6,
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
        orderIndex: 6,
        display: true,
    },
    {
        id: 7,
        time: "15.00 – 16.00 น.",
        session: "afternoon",
        category: "ถาม - ตอบ & กิจกรรม",
        categoryColor: "purple",
        title: "ถาม - ตอบ พร้อมรับของที่ระลึก (เกมพันธุ์แท้ มจธ.)",
        subSectionTitle: "กิจกรรมภายในงาน มีทั้งหมด 3 โซน",
        subSectionItems: [
            "โซนที่ 1: Admission Consult & Portfolio Clinic",
            "โซนที่ 2: บูทคณะต่าง ๆ (ให้ข้อมูลหลักสูตรและคัดเลือกแฟ้มสะสมผลงาน)",
            "โซนที่ 3: KMUTT Industry Consultation Clinic (ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า - ทีม LISA)",
        ],
        orderIndex: 7,
        display: true,
    },
    {
        id: 8,
        time: "15.00 – 17.00 น.",
        session: "afternoon",
        category: "โซน 3 (ทีม LISA)",
        categoryColor: "teal",
        title: "KMUTT Industry Consultation Clinic",
        details: [
            "ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า",
            "ดำเนินกิจกรรมโดยทีม LISA (กลุ่มงานส่งเสริมและจัดการการเรียนรู้ตลอดชีวิต)",
            "เวลา 15.00 – 17.00 น.",
        ],
        orderIndex: 8,
        display: true,
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

    const [scheduleList, setScheduleList] = useState<LandingScheduleItem[]>(defaultScheduleData);

    useEffect(() => {
        fetch("/api/landing/schedule")
            .then(async (res) => {
                if (!res.ok) return null;
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setScheduleList(data);
                }
            })
            .catch((err) => {
                console.warn("Using default schedule data due to fetch error:", err);
            });
    }, []);

    const filteredData = scheduleList.filter((item) => {
        if (!item.display) return false;
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
            <TableContainer overflowX="auto">
                <Table variant="simple" size="md">
                    <Thead bg={headBg}>
                        <Tr>
                            <Th
                                color="#FA4616"
                                fontSize="sm"
                                py={4}
                                width={{ base: "40%", sm: "30%", md: "25%" }}
                                textTransform="none"
                                letterSpacing="normal"
                            >
                                <HStack spacing={2}>
                                    <Clock size={16} />
                                    <Text fontWeight="bold">เวลา</Text>
                                </HStack>
                            </Th>
                            <Th
                                color="#FA4616"
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
                        {filteredData.map((item) => (
                            <Tr
                                key={item.id}
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
                                            color="#FA4616"
                                            whiteSpace={{ base: "normal", sm: "nowrap" }}
                                            lineHeight="1.4"
                                        >
                                            {item.time}
                                        </Text>
                                        <Badge
                                            colorScheme={item.categoryColor || "orange"}
                                            variant="subtle"
                                            rounded="md"
                                            px={2}
                                            py={0.5}
                                            fontSize="xs"
                                            wordBreak="break-word"
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
                                        <VStack align="flex-start" spacing={3} w="full">
                                            <Text
                                                fontWeight="bold"
                                                fontSize={{ base: "sm", md: "md" }}
                                                color={textColor}
                                                lineHeight="1.5"
                                            >
                                                {item.title}
                                            </Text>

                                            {item.details && item.details.length > 0 && (
                                                <List spacing={2} pl={{ base: 1, md: 2 }} w="full">
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
                                                                color="#FA4616"
                                                                mt="3px"
                                                                boxSize="14px"
                                                                flexShrink={0}
                                                            />
                                                            <Text wordBreak="break-word">{detail}</Text>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            )}

                                            {(item.subSectionTitle || (item.subSectionItems && item.subSectionItems.length > 0)) && (
                                                <Box
                                                    mt={2}
                                                    p={3}
                                                    bg={useColorModeValue("orange.50", "whiteAlpha.50")}
                                                    rounded="xl"
                                                    border="1px dashed"
                                                    borderColor={useColorModeValue("orange.200", "orange.700")}
                                                    w="100%"
                                                >
                                                    {item.subSectionTitle && (
                                                        <Text
                                                            fontWeight="semibold"
                                                            fontSize={{ base: "xs", sm: "sm" }}
                                                            color="#FA4616"
                                                            mb={2}
                                                        >
                                                            {item.subSectionTitle}
                                                        </Text>
                                                    )}
                                                    {item.subSectionItems && item.subSectionItems.length > 0 && (
                                                        <List spacing={1.5} pl={2}>
                                                            {item.subSectionItems.map((zone, zIdx) => (
                                                                <ListItem
                                                                    key={zIdx}
                                                                    display="flex"
                                                                    alignItems="flex-start"
                                                                    fontSize={{ base: "xs", sm: "sm" }}
                                                                    color={subTextColor}
                                                                    lineHeight="1.5"
                                                                >
                                                                    <Text mr={2} color="#FA4616" fontWeight="bold">
                                                                        •
                                                                    </Text>
                                                                    <Text wordBreak="break-word">{zone}</Text>
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    )}
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
