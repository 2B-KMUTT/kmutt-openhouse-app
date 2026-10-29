import {
    Box,
    VStack,
    Button,
    useColorModeValue,
    Divider,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { signOut } from "next-auth/react"
import { PRIMARY } from "@/constants/colors"
import { KM_MENU_ITEMS } from "@/constants/kmNavigation"

const KMSidebar = () => {
    const bgColor = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.100", "gray.600")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const router = useRouter()

    return (
        <Box
            bg={bgColor}
            w="260px"
            h="fit-content"
            p={4}
            rounded="2xl"
            shadow="md"
            flexShrink={0}
        >
            <VStack align="stretch" spacing={1.5}>
                {KM_MENU_ITEMS.map((item, index) => {
                    if (item.divider) {
                        return <Divider key={`divider-${index}`} my={1} />
                    }

                    const isActive = item.link && router.pathname === item.link
                    const IconComp = item.icon!

                    return (
                        <Button
                            key={item.label || index}
                            onClick={async () => {
                                if (item.isLogout) {
                                    await signOut({ redirect: false })
                                    window.location.href = "/login"
                                } else if (item.link) {
                                    router.push(item.link)
                                }
                            }}
                            variant={isActive ? "solid" : "ghost"}
                            colorScheme={isActive ? "orange" : undefined}
                            bg={isActive ? PRIMARY : undefined}
                            color={isActive ? "white" : textColor}
                            justifyContent="start"
                            _hover={{ bg: isActive ? PRIMARY : hoverBg }}
                            leftIcon={<IconComp size={18} />}
                            fontWeight="medium"
                            size="sm"
                            rounded="lg"
                            h="38px"
                            fontSize="xs"
                        >
                            {item.label}
                        </Button>
                    )
                })}
            </VStack>
        </Box>
    )
}

export default KMSidebar