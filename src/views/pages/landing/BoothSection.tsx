import { useEffect, useState } from "react";
import { Container, Box, Heading, SimpleGrid, Text, VStack, Stack, Badge, useColorModeValue } from "@chakra-ui/react";
import { LandingBoothItem } from "@/interfaces/LandingContent";

const PRIMARY = "#F04E23"; // KMUTT Orange Red
const SECONDARY = "#FFC233"; // KMUTT Yellow

const defaultBoothData: LandingBoothItem[] = [
    {
        id: 1,
        location: "โซนที่ 1: Admission Consult & Portfolio Clinic",
        units: [
            "ให้คำปรึกษาการสมัครเข้าศึกษาต่อ",
            "คลินิกแฟ้มสะสมผลงาน (Portfolio Clinic)",
            "แนะนำทุนการศึกษา มจธ.",
            "พบปะและปรึกษากับเจ้าหน้าที่สำนักงานคัดเลือกและสรรหานักศึกษา",
        ],
        orderIndex: 1,
        display: true,
    },
    {
        id: 2,
        location: "โซนที่ 2: บูทคณะและหน่วยงานต่าง ๆ",
        units: [
            "ให้ข้อมูลหลักสูตรระดับปริญญาตรีและแนวทางการศึกษา",
            "คัดเลือกแฟ้มสะสมผลงานโดยคณาจารย์จาก มจธ. อย่างใกล้ชิด",
            "คณะวิศวกรรมศาสตร์",
            "คณะวิทยาศาสตร์",
            "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
            "คณะเทคโนโลยีสารสนเทศ",
            "คณะสถาปัตยกรรมศาสตร์และการออกแบบ",
            "มจธ.ราชบุรี",
        ],
        orderIndex: 2,
        display: true,
    },
    {
        id: 3,
        location: "โซนที่ 3: KMUTT Industry Consultation Clinic",
        units: [
            "ให้คำปรึกษาแก่ผู้ประกอบการและศิษย์เก่า",
            "แนะนำหลักสูตรและบริการโดยทีม LISA (Lifelong Learning Support and Administration Unit)",
            "เวลา 15.00 – 17.00 น.",
        ],
        orderIndex: 3,
        display: true,
    },
];

const BoothSection = () => {
    const bgSection = useColorModeValue("gray.50", "gray.800");
    const bgCard = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.700", "gray.200");
    const badgeBg = useColorModeValue(SECONDARY, PRIMARY);
    const badgeText = useColorModeValue("black", "white");

    const [booths, setBooths] = useState<LandingBoothItem[]>(defaultBoothData);

    useEffect(() => {
        fetch("/api/landing/booth")
            .then(async (res) => {
                if (!res.ok) return null;
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setBooths(data);
                }
            })
            .catch((err) => {
                console.warn("Using default booth data due to fetch error:", err);
            });
    }, []);

    // Calculate grid columns and container max-width dynamically based on number of cards
    const count = booths.length;
    let gridCols = { base: 1, md: 2, lg: 3 };
    let containerMaxW = "6xl";

    if (count === 1) {
        gridCols = { base: 1, md: 1, lg: 1 };
        containerMaxW = "xl";
    } else if (count === 2) {
        gridCols = { base: 1, md: 2, lg: 2 };
        containerMaxW = "4xl";
    } else if (count === 3) {
        gridCols = { base: 1, md: 2, lg: 3 };
        containerMaxW = "6xl";
    } else if (count === 4) {
        gridCols = { base: 1, md: 2, lg: 2 };
        containerMaxW = "5xl";
    } else {
        gridCols = { base: 1, md: 2, lg: 3 };
        containerMaxW = "7xl";
    }

    return (
        <Box as="section" id="booth" py={{ base: 8, md: 12 }} px={{ base: 4, md: 8 }} bg={bgSection}>
            <VStack spacing={3} mb={10} textAlign="center">
                <Heading size="xl" color={PRIMARY} lineHeight="short">
                   บูทแนะนำหลักสูตร & กิจกรรมภายในงาน
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={textColor} maxW="700px">
                    เปิดโอกาสให้นักเรียน ครูแนะแนว ผู้ประกอบการ และผู้สนใจ พบปะคณาจารย์และผู้เชี่ยวชาญจาก มจธ. อย่างใกล้ชิด
                </Text>
                <Badge bg={badgeBg} color={badgeText} px={4} py={1} fontSize={{ base: "sm", sm: "md", md: "1.1rem" }} rounded="full">
                    วันเสาร์ที่ 30 ตุลาคม 2569 | 09.00 – 17.00 น.
                </Badge>
            </VStack>
            <Container maxW={containerMaxW} centerContent px={{ base: 0, sm: 4 }}>
                <SimpleGrid columns={gridCols} spacing={{ base: 4, md: 6 }} w="full">
                    {booths.map((booth) => (
                        <Box
                            key={booth.id}
                            p={{ base: 4, sm: 5, md: 6 }}
                            bg={bgCard}
                            borderRadius="xl"
                            borderLeft={`6px solid ${PRIMARY}`}
                            shadow="sm"
                            display="flex"
                            flexDirection="column"
                            justifyContent="flex-start"
                            h="full"
                            wordBreak="break-word"
                            _hover={{ shadow: "md", transform: "translateY(-3px)", transition: "all 0.2s ease" }}
                        >
                            <Heading size={{ base: "sm", md: "md" }} mb={3} color={PRIMARY} lineHeight="short">
                                {booth.location}
                            </Heading>
                            <Stack spacing={2} flex="1">
                                {booth.units && booth.units.map((unit, i) => (
                                    <Text key={i} fontSize={{ base: "xs", sm: "sm" }} color={textColor} lineHeight="1.6">
                                        • {unit}
                                    </Text>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default BoothSection;

