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
    MdQuestionAnswer,
    MdCalendarToday,
    MdStorefront,
} from "react-icons/md"
import { useRouter } from "next/router"
import { signOut } from "next-auth/react"

const KMSidebar = () => {
    const PRIMARY = "#F04E23"
    const bgColor = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.200", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const router = useRouter()

    const menuItems = [
        { label: "กิจกรรมทั้งหมด", icon: MdDashboard, link: "/_km/dashboard" },
        { label: "เพิ่มกิจกรรม", icon: MdAddBusiness, link: "/_km/activity/add" },
        { label: "จัดการ Staff", icon: MdPerson, link: "/_km/staff" },
        { label: "จัดการกำหนดการหน้าแรก", icon: MdCalendarToday, link: "/_km/landing-schedule" },
        { label: "จัดการบูท & โซนหน้าแรก", icon: MdStorefront, link: "/_km/landing-booth" },
        { label: "ออกจากระบบ", icon: MdLogout, isLogout: true }
    ]


    return (
        <>
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
        </>
    )
}

export default KMSidebar
