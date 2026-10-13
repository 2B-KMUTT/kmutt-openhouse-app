import { Container, Box, Heading, SimpleGrid, Text, VStack, Stack, Badge, useColorModeValue } from "@chakra-ui/react";


const PRIMARY = "#F04E23"; // KMUTT Orange Red
const SECONDARY = "#FFC233"; // KMUTT Yellow

const BoothSection = () => {
    const bgSection = useColorModeValue("gray.50", "gray.800");
    const bgCard = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.700", "gray.200");
    const badgeBg = useColorModeValue(SECONDARY, PRIMARY);
    const badgeText = useColorModeValue("black", "white");

    const boothData = [
        {
            location: "โซนที่ 1: Admission Consult & Portfolio Clinic",
            units: [
                "ให้คำปรึกษาการสมัครเข้าศึกษาต่อรอบ TCAS70",
                "คลินิกแฟ้มสะสมผลงาน (Portfolio Clinic)",
                "แนะนำทุนการศึกษา มจธ.",
                "พบปะและปรึกษากับเจ้าหน้าที่สำนักงานคัดเลือกและสรรหานักศึกษา",
            ],
        },
        {
            location: "โซนที่ 2: บูธคณะและหน่วยงานต่าง ๆ",
            units: [
                "ให้ข้อมูลหลักสูตรระดับปริญญาตรีและแนวทางการศึกษา",
                "คัดเลือกแฟ้มสะสมผลงานโดยคณาจารย์จาก มจธ. อย่างใกล้ชิด",
                "คณะวิศวกรรมศาสตร์",
                "คณะวิทยาศาสตร์",
                "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
                "คณะเทคโนโลยีสารสนเทศ",
                "คณะสถาปัตยกรรมศาสตร์และการออกแบบ",
                "สถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO)",
            ],
        },
        {
            location: "โซนที่ 3: กิจกรรมเวิร์กช็อป การทำเจลาโต",
            units: [
                "เวิร์กช็อปการทำไอศกรีมเจลาโต",
                "เรียนรู้กระบวนการและเทคโนโลยีอาหาร",
                "กิจกรรมสนุกสนานและรับของที่ระลึก",
            ],
        },
    ];

    return (
        <Box as="section" id="booth" py={{ base: 8, md: 12 }} px={{ base: 4, md: 8 }} bg={bgSection}>
            <VStack spacing={3} mb={10} textAlign="center">
                <Heading size="xl" color={PRIMARY} lineHeight="short">
                    บูธแนะนำหลักสูตร & กิจกรรมภายในงาน
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={textColor} maxW="700px">
                    เปิดโอกาสให้นักเรียน ครูแนะแนว และผู้สนใจในพื้นที่ร้อยเอ็ดและจังหวัดใกล้เคียง พบปะคณาจารย์จาก มจธ. อย่างใกล้ชิด
                </Text>
                <Badge bg={badgeBg} color={badgeText} px={4} py={1} fontSize="1.2rem">
                    วันศุกร์ที่ 30 ตุลาคม 2569 | 09.00 – 16.00 น.
                </Badge>
            </VStack>
            <Container maxW="7xl" centerContent>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {boothData.map((booth, index) => (
                        <Box
                            maxH={"270px"}
                            overflow={"auto"}
                            key={index}
                            p={{ base: 4, md: 6 }}
                            bg={bgCard}
                            borderRadius="lg"
                            borderLeft={`6px solid ${PRIMARY}`}
                            shadow="sm"
                            _hover={{ shadow: "md", transform: "translateY(-2px)", transition: "0.2s" }}
                        >
                            <Heading size="md" mb={3} color={PRIMARY} lineHeight="short">
                                {booth.location}
                            </Heading>
                            <Stack spacing={-2}>
                                {booth.units.map((unit, i) => (
                                    <Text key={i} fontSize={{ base: "sm", md: "sm" }} color={textColor}>
                                        • {unit}
                                    </Text>
                                ))}
                            </Stack>
                        </Box>
                    ))
                    }
                </SimpleGrid >
            </Container>
        </Box>
    );
};

export default BoothSection;
