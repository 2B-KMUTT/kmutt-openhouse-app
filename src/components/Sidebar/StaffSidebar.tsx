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
    MdAddBusiness,
    MdLogout,
    MdQuestionAnswer
} from "react-icons/md"
import { useRouter } from "next/router"
import { signOut } from "next-auth/react"

const StaffSidebar = () => {
    const PRIMARY = "#FA4616"
    const bgColor = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.200", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const router = useRouter()

    const menuItems = [
        { label: "กิจกรรมทั้งหมด", icon: MdDashboard, link: "/staff/dashboard" },
        //ตั้งค่ารหัสผ่านให้นักเรียน
        { label: "ตั้งค่ารหัสผ่านให้นักเรียน", icon: MdSettings, link: "/staff/student-setting" },
        // { label: "สแกน QR Code", icon: MdQrCode, link: "/staff/scan" },
        { label: "ออกจากระบบ", icon: MdLogout, isLogout: true }
    ]

    return (
        <Box
            bg={bgColor}
            w="250px"
            h="fit-content"
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
                            } else if (item.link) {
                                router.push(item.link)
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

export default StaffSidebar
