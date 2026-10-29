"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, Spinner, useColorModeValue } from "@chakra-ui/react";

const PRIMARY = "#FA4616"; // KMUTT Orange Red

type StatsResponse = {
    activitiesCount: number;
    registrationsCount: number;
};

const StatSection = () => {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const cardBg = useColorModeValue("white", "gray.800");
    const cardShadow = useColorModeValue("lg", "dark-lg");
    const textColor = useColorModeValue("gray.700", "gray.200");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/student/stats");
                if (!res.ok) {
                    console.warn("Stats API returned non-OK status:", res.status);
                    setStats({ activitiesCount: 0, registrationsCount: 0 });
                    return;
                }
                const data = await res.json();
                if (
                    data &&
                    typeof data.activitiesCount === "number" &&
                    typeof data.registrationsCount === "number"
                ) {
                    setStats(data);
                } else {
                    setStats({ activitiesCount: 0, registrationsCount: 0 });
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                setStats({ activitiesCount: 0, registrationsCount: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <Box py={{ base: 10, md: 16 }} px={{ base: 6, md: 16 }} bg={useColorModeValue("gray.50", "gray.900")}>
            <Box textAlign="center" mb={10}>
                <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" color={PRIMARY}>
                    สถิติภาพรวม
                </Text>
                <Text fontSize={{ base: "md", md: "lg" }} color={textColor}>
                    ดูจำนวนกิจกรรมและผู้เข้าร่วมงานทั้งหมดของ Open House
                </Text>
            </Box>

            {loading ? (
                <Flex justify="center">
                    <Spinner size="xl" />
                </Flex>
            ) : stats ? (
                <Flex
                    justify="center"
                    align="stretch"
                    gap={8}
                    wrap="wrap"
                    maxW="900px"
                    mx="auto"
                >
                    {/* Card: กิจกรรม */}
                    <Box
                        flex="1"
                        minW="250px"
                        bg={cardBg}
                        borderRadius="2xl"
                        boxShadow={cardShadow}
                        p={8}
                        textAlign="center"
                    >
                        <Text fontSize="5xl" fontWeight="extrabold" color={PRIMARY}>
                            {stats.activitiesCount?.toLocaleString() ?? 0}
                        </Text>
                        <Text fontSize="lg" color={textColor}>
                            กิจกรรมทั้งหมด
                        </Text>
                    </Box>

                    {/* Card: ผู้ลงทะเบียน */}
                    <Box
                        flex="1"
                        minW="250px"
                        bg={cardBg}
                        borderRadius="2xl"
                        boxShadow={cardShadow}
                        p={8}
                        textAlign="center"
                    >
                        <Text fontSize="5xl" fontWeight="extrabold" color={PRIMARY}>
                            {stats.registrationsCount?.toLocaleString() ?? 0}
                        </Text>
                        <Text fontSize="lg" color={textColor}>
                            ผู้ลงทะเบียนทั้งหมด
                        </Text>
                    </Box>
                </Flex>
            ) : (
                <Text textAlign="center" color="red.500">
                    ไม่สามารถโหลดข้อมูลได้
                </Text>
            )}
        </Box>
    );
};

export default StatSection;
