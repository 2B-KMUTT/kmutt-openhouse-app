import {
    Box,
    VStack,
    Button,
    HStack,
    Text,
    useColorModeValue,
    Divider,
} from "@chakra-ui/react"
import {
    MdDashboard,
    MdPerson,
    MdAddBusiness,
    MdLogout,
    MdCalendarToday,
    MdStorefront,
    MdImage,
    MdTune,
    MdPoll,
    MdAssessment,
} from "react-icons/md"
import { useRouter } from "next/router"
import { signOut } from "next-auth/react"
import { PRIMARY } from "@/constants/colors"

const KMSidebar = () => {
    const bgColor = useColorModeValue("white", "gray.700")
    const hoverBg = useColorModeValue("gray.200", "gray.700")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const router = useRouter()

    const menuItems = [
        { label: "กิจกรรมทั้งหมด", icon: MdDashboard, link: "/_km/dashboard" },
        { label: "เพิ่มกิจกรรม", icon: MdAddBusiness, link: "/_km/activity/add" },
        { label: "จัดการ Staff", icon: MdPerson, link: "/_km/staff" },
        { divider: true },
        { label: "จัดการ Banner หน้าแรก", icon: MdImage, link: "/_km/landing-banner" },
        { label: "จัดการข้อความหน้าแรก", icon: MdTune, link: "/_km/landing-settings" },
        { label: "จัดการกำหนดการหน้าแรก", icon: MdCalendarToday, link: "/_km/landing-schedule" },
        { label: "จัดการบูท & โซนหน้าแรก", icon: MdStorefront, link: "/_km/landing-booth" },
        { divider: true },
        { label: "ตั้งค่าแบบสอบถาม", icon: MdPoll, link: "/_km/survey-settings" },
        { label: "รายงานผลแบบสอบถาม", icon: MdAssessment, link: "/survey-report" },
        { divider: true },
        { label: "ออกจากระบบ", icon: MdLogout, isLogout: true },
    ]

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
                {menuItems.map((item, index) => {
                    if (item.divider) {
                        return <Divider key={`divider-${index}`} my={1} />
                    }

                    const isActive = item.link && router.pathname === item.link
                    const IconComp = item.icon!

                    return (
                        <Button
                            key={item.label}
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
