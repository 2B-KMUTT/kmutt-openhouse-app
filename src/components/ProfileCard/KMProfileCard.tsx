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

import { PRIMARY } from "@/constants/colors"
import { KMProfile } from "@/interfaces/KMProfile"

const KMProfileCard = ({ data }: { data: KMProfile }) => {
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
                        name={data.name}
                        size={{ base: "md", md: "md" }}
                        bg={PRIMARY}
                        color="white"
                    >
                        <AvatarBadge boxSize={{ base: "1em", md: "1em" }} bg="green.400" />
                    </Avatar>
                    <VStack align="start" spacing={1} lineHeight={{ base: "12px", md: "18px" }}>
                        <Heading size={{ base: "sm", md: "sm" }} color={textColor}>
                            {data.name}
                        </Heading>
                        <Text color={textColor} fontSize={{ base: "xs", md: "sm" }}>
                            {data.username} • KMUTT Account
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

export default KMProfileCard