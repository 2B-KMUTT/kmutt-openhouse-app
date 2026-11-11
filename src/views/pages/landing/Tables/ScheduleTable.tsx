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
import { PRIMARY } from "@/constants/colors";
import defaultScheduleDataRaw from "../../../../../prisma/data/landing-schedules.json";

const defaultScheduleData = defaultScheduleDataRaw as LandingScheduleItem[];

interface ScheduleTableProps {
    filter?: "all" | "morning" | "afternoon";
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ filter = "all" }) => {
    const tableBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headBg = useColorModeValue("orange.50", "whiteAlpha.100");
    const breakBg = useColorModeValue("amber.50", "whiteAlpha.50");
    const hoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const subTextColor = useColorModeValue("gray.600", "gray.300");
    const subSectionBg = useColorModeValue("orange.50", "whiteAlpha.50");
    const subSectionBorderColor = useColorModeValue("orange.200", "orange.700");

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
        if (filter === "morning") return item.session === "morning" || item.session === "all";
        if (filter === "afternoon") return item.session === "afternoon" || item.session === "all";
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
            <TableContainer overflowX="auto" whiteSpace="normal">
                <Table variant="simple" size={{ base: "sm", md: "md" }} minW="600px">
                    <Thead bg={headBg}>
                        <Tr>
                            <Th
                                py={{ base: 3, md: 4 }}
                                px={{ base: 3, md: 6 }}
                                fontSize={{ base: "xs", md: "sm" }}
                                fontWeight="bold"
                                color={PRIMARY}
                                textTransform="none"
                                w={{ base: "32%", sm: "28%", md: "24%" }}
                            >
                                <HStack spacing={2}>
                                    <Clock size={16} />
                                    <Text>เวลา</Text>
                                </HStack>
                            </Th>
                            <Th
                                py={{ base: 3, md: 4 }}
                                px={{ base: 3, md: 6 }}
                                fontSize={{ base: "xs", md: "sm" }}
                                fontWeight="bold"
                                color={PRIMARY}
                                textTransform="none"
                            >
                                รายละเอียดกิจกรรม
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredData.map((item, idx) => (
                            <Tr
                                key={item.id ?? idx}
                                bg={item.isBreak ? breakBg : "transparent"}
                                _hover={{ bg: hoverBg }}
                                transition="background-color 0.15s ease"
                                borderBottom="1px solid"
                                borderColor={borderColor}
                            >
                                <Td
                                    verticalAlign="top"
                                    py={{ base: 4, md: 5 }}
                                    px={{ base: 3, md: 6 }}
                                >
                                    <VStack align="start" spacing={1.5}>
                                        <HStack spacing={1.5} color={item.isBreak ? "amber.600" : PRIMARY}>
                                            {item.isBreak ? <Coffee size={14} /> : <Clock size={14} />}
                                            <Text
                                                fontWeight="bold"
                                                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                                                letterSpacing="tight"
                                            >
                                                {item.time}
                                            </Text>
                                        </HStack>
                                        <Badge
                                            colorScheme={item.categoryColor || "gray"}
                                            variant="subtle"
                                            fontSize={{ base: "2xs", sm: "xs" }}
                                            px={2}
                                            py={0.5}
                                            rounded="full"
                                            whiteSpace="normal"
                                            textAlign="left"
                                        >
                                            {item.category}
                                        </Badge>
                                    </VStack>
                                </Td>

                                <Td
                                    verticalAlign="top"
                                    py={{ base: 4, md: 5 }}
                                    px={{ base: 3, md: 6 }}
                                >
                                    {item.isBreak ? (
                                        <HStack spacing={2} color="amber.700">
                                            <Coffee size={18} />
                                            <Text
                                                fontWeight="bold"
                                                fontSize={{ base: "sm", md: "md" }}
                                            >
                                                {item.title}
                                            </Text>
                                        </HStack>
                                    ) : (
                                        <VStack align="start" spacing={2} w="100%">
                                            <Text
                                                fontWeight="bold"
                                                fontSize={{ base: "sm", md: "md" }}
                                                color={textColor}
                                                lineHeight="1.4"
                                            >
                                                {item.title}
                                            </Text>

                                            {item.details && item.details.length > 0 && (
                                                <List spacing={1.5} w="100%">
                                                    {item.details.map((detail, dIdx) => (
                                                        <ListItem
                                                            key={dIdx}
                                                            display="flex"
                                                            alignItems="flex-start"
                                                            fontSize={{ base: "xs", sm: "sm" }}
                                                            color={subTextColor}
                                                            lineHeight="1.5"
                                                        >
                                                            <ListIcon
                                                                as={CheckCircle2}
                                                                color={PRIMARY}
                                                                mt={0.5}
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
                                                    bg={subSectionBg}
                                                    rounded="xl"
                                                    border="1px dashed"
                                                    borderColor={subSectionBorderColor}
                                                    w="100%"
                                                >
                                                    {item.subSectionTitle && (
                                                        <Text
                                                            fontWeight="semibold"
                                                            fontSize={{ base: "xs", sm: "sm" }}
                                                            color={PRIMARY}
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
                                                                    <Text mr={2} color={PRIMARY} fontWeight="bold">
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

export default ScheduleTable;
export { ScheduleTable };
