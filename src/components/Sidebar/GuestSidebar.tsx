import {
    Box,
    VStack,
    Button,
    HStack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react"
import {
    MdDashboard,
    MdQrCode,
    MdPerson,
    MdSettings,
    MdLogout,
} from "react-icons/md"
import { signOut } from "next-auth/react"

const GuestSidebar = () => {
    const PRIMARY = "#F04E23"
    const bgColor = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.200", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")

    const menuItems = [
        { label: "Dashboard", icon: MdDashboard },
        { label: "QR Code", icon: MdQrCode },
        { label: "Profile", icon: MdPerson },
        { label: "Settings", icon: MdSettings },
        { label: "ออกจากระบบ", icon: MdLogout, isLogout: true },
    ]

    return (
        <Box
            bg={bgColor}
            w="250px"
            p={5}
            rounded="2xl"
            shadow="md"
            flexShrink={0}
        >
            <VStack align="stretch" spacing={3}>
                {menuItems.map((item) => (
                    <Button
                        onClick={async () => {
                            if (item.isLogout) {
                                await signOut({ redirect: false })
                                window.location.href = "/login"
                            }
                        }}
                        key={item.label}
                        variant="ghost"
                        justifyContent="start"
                        _hover={{ bg: hoverBg }}
                        leftIcon={<item.icon />}
                        color={textColor}
                        fontWeight="medium"
                        size="md"
                        rounded="lg"
                    >
                        {item.label}
                    </Button>
                ))}
            </VStack>
        </Box>
    )
}

export default GuestSidebar
