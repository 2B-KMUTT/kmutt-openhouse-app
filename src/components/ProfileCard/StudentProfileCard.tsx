import {
    Box,
    Flex,
    Heading,
    Text,
    Avatar,
    AvatarBadge,
    VStack,
    HStack,
    useColorModeValue,
} from "@chakra-ui/react"

const PRIMARY = "#FA4616"
import { StudentProfile } from "@/interfaces/KMProfile"

const StudentProfileCard = ({ data }: { data: StudentProfile }) => {
    const cardBg = useColorModeValue("white", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")
    return (
        <Box
            mt={{ base: -4, md: 0 }}
            bg={cardBg}
            p={{ base: 4, md: 6 }}
            rounded="2xl"
            shadow="lg"
            mb={6}
            borderLeft={`5px solid ${PRIMARY}`}
        >
            <Flex align="center" justify="space-between" wrap="wrap">
                <HStack spacing={5}>
                    <Avatar
                        name={data.first_name + " " + data.last_name}
                        size={{ base: "md", md: "md" }}
                        bg={PRIMARY}
                        color="white"
                    >
                        <AvatarBadge boxSize={{ base: "1em", md: "1em" }} bg="green.400" />
                    </Avatar>
                    <VStack align="start" spacing={1} lineHeight={{ base: "12px", md: "18px" }}>
                        <Heading size={{ base: "sm", md: "sm" }} color={textColor}>
                            {data.first_name} {data.last_name}
                        </Heading>
                        <Text color={textColor} fontSize={{ base: "xs", md: "sm" }}>
                            {data.school} • {data.province}
                        </Text>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                            {data.email}
                        </Text>
                    </VStack>
                </HStack>

            </Flex>
        </Box>
    )

}

export default StudentProfileCard