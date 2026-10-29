"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    VStack,
    Heading,
    Text,
    Alert,
    AlertIcon,
    Flex,
    Icon,
    SimpleGrid,
    useColorModeValue,
    Select,
    Switch,
    HStack,
    useToast,
} from "@chakra-ui/react"
import { UserPlus } from "lucide-react"
import Head from "next/head"

import { PRIMARY, SECONDARY } from "@/constants/colors"

// รายชื่อจังหวัดไทย
export const provincesTH = [
    "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
    "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร",
    "เชียงใหม่", "เชียงราย", "ตรัง", "ตราด", "ตาก", "นครนายก",
    "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี",
    "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
    "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พังงา", "พัทลุง", "พิจิตร",
    "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "พะเยา", "ภูเก็ต",
    "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด",
    "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน",
    "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
    "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย",
    "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง",
    "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
]

export const provincesEN = [
    "Bangkok", "Krabi", "Kanchanaburi", "Kalasin", "Kamphaeng Phet", "Khon Kaen",
    "Chanthaburi", "Chachoengsao", "Chonburi", "Chai Nat", "Chaiyaphum", "Chumphon",
    "Chiang Mai", "Chiang Rai", "Trang", "Trat", "Tak", "Nakhon Nayok",
    "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima", "Nakhon Si Thammarat", "Nakhon Sawan", "Nonthaburi",
    "Narathiwat", "Nan", "Bueng Kan", "Buri Ram", "Pathum Thani", "Prachuap Khiri Khan",
    "Prachin Buri", "Pattani", "Phra Nakhon Si Ayutthaya", "Phang Nga", "Phatthalung", "Phichit",
    "Phitsanulok", "Phetchaburi", "Phetchabun", "Phrae", "Phayao", "Phuket",
    "Maha Sarakham", "Mukdahan", "Mae Hong Son", "Yasothon", "Yala", "Roi Et",
    "Ranong", "Rayong", "Ratchaburi", "Lopburi", "Lampang", "Lamphun",
    "Loei", "Si Sa Ket", "Sakon Nakhon", "Songkhla", "Satun", "Samut Prakan",
    "Samut Songkhram", "Samut Sakhon", "Sa Kaeo", "Saraburi", "Sing Buri", "Sukhothai",
    "Suphan Buri", "Surat Thani", "Surin", "Nong Khai", "Nong Bua Lamphu", "Ang Thong",
    "Amnat Charoen", "Udon Thani", "Uttaradit", "Uthai Thani", "Ubon Ratchathani"
]


export const roles = [
    { value: "student", labelTH: "นักเรียน", labelEN: "Student" },
    { value: "teacher", labelTH: "ครู/อาจารย์", labelEN: "Teacher" },
    { value: "parent", labelTH: "ผู้ปกครอง", labelEN: "Parent" },
    { value: "guest", labelTH: "บุคคลทั่วไป", labelEN: "Guest" },
]

// ตรวจสอบเลขบัตรประชาชนไทย
const isValidCitizenId = (id: string) => {
    if (!/^[0-9]{13}$/.test(id)) return false
    let sum = 0
    for (let i = 0; i < 12; i++) {
        sum += parseInt(id.charAt(i)) * (13 - i)
    }
    return (11 - (sum % 11)) % 10 === parseInt(id.charAt(12))
}

export function RegisterPage() {
    const toast = useToast()
    const [form, setForm] = useState<Record<string, string>>({ role: "student" })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [lang, setLang] = useState<"TH" | "EN">("TH")
    const [usePassport, setUsePassport] = useState(false)
    const router = useRouter()


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")


        // Validation
        if (!form.first_name?.trim() || !form.last_name?.trim()) {
            setError("กรุณากรอกชื่อ-นามสกุล")
            setIsLoading(false)
            return
        }

        if (!form.school?.trim() && (form.role == "student" || form.role == "teacher")) {
            setError("กรุณากรอกโรงเรียน")
            setIsLoading(false)
            return
        }

        if (!form.province && (form.role == "student" || form.role == "teacher")) {
            setError("กรุณาเลือกจังหวัด")
            setIsLoading(false)
            return
        }

        if (!usePassport) {
            if (form.role == "student" && (!form.citizen_id || !isValidCitizenId(form.citizen_id.trim()))) {
                setError("เลขบัตรประชาชนไม่ถูกต้อง")
                setIsLoading(false)
                return
            }
            if (form.role != "student" && form.citizen_id?.trim() && !isValidCitizenId(form.citizen_id.trim())) {
                setError("เลขบัตรประชาชนไม่ถูกต้อง")
                setIsLoading(false)
                return
            }
        } else {
            if (!form.passport_id?.trim() && form.role == "student") {
                setError("กรุณากรอก Passport ID")
                setIsLoading(false)
                return
            }
        }

        if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError("อีเมลไม่ถูกต้อง")
            setIsLoading(false)
            return
        }

        if (!form.phone?.trim() || !/^[0-9]{10}$/.test(form.phone.trim())) {
            setError("เบอร์โทรศัพท์ต้องมี 10 หลัก")
            setIsLoading(false)
            return
        }

        // ตรวจสอบรหัสผ่าน
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

        if (!form.password || !passwordRegex.test(form.password)) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว และประกอบด้วยทั้งตัวอักษรและตัวเลข")
            setIsLoading(false)
            return
        }

        if (form.password !== form.confirm_password) {
            setError("รหัสผ่านไม่ตรงกัน")
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            if (res.ok) {
                toast({
                    title: "สมัครสมาชิกสำเร็จ! กำลังไปหน้า Login...",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                })
                // wait 2 seconds and redirect to /login
                await new Promise((resolve) => setTimeout(resolve, 2000))
                router.push("/login")
            } else {
                const data = await res.json()
                setError(data?.message || "การสมัครสมาชิกไม่สำเร็จ")
            }
        } catch {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
        }

        setIsLoading(false)
    }

    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    const provinces = lang === "TH" ? provincesTH : provincesEN

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bgGradient={`linear(to-br, ${SECONDARY}50, ${PRIMARY}80)`}
            p={4}
        >
            <Head>
                <title>Openhouse - ลงทะเบียน / Register</title>
            </Head>
            <Box
                w="full"
                maxW="lg"
                bg={cardBg}
                rounded="2xl"
                shadow="xl"
                p={10}
                border="1px solid"
                borderColor={useColorModeValue("orange.100", "gray.700")}
            >
                {/* Header */}
                <Flex direction="column" align="center" mb={6}>
                    <Flex
                        w={16}
                        h={16}
                        bg={useColorModeValue("orange.50", "gray.700")}
                        rounded="full"
                        align="center"
                        justify="center"
                        mb={4}
                    >
                        <Icon as={UserPlus} w={8} h={8} color={PRIMARY} />
                    </Flex>
                    <Heading size="lg" mb={1} color={PRIMARY}>
                        {lang === "TH" ? "สมัครสมาชิก / ลงทะเบียน" : "Register"}
                    </Heading>
                    <Text color={textColor} fontSize="sm">
                        {lang === "TH" ? "เปิดเฮือน มจธ. (มดอีสาน) ณ โรงแรมเพชรรัชต์การ์เด้น จ.ร้อยเอ็ด" : "KMUTT Open House at Petcharat Garden Hotel, Roi Et"}
                    </Text>
                </Flex>

                {/* Switch Language */}
                <HStack justify="flex-end" mb={4}>
                    <Text fontSize="sm">TH</Text>
                    <Switch
                        isChecked={lang === "EN"}
                        onChange={() => setLang(lang === "TH" ? "EN" : "TH")}
                        colorScheme="orange"
                    />
                    <Text fontSize="sm">EN</Text>
                </HStack>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <VStack spacing={5}>
                        {/* Role */}
                        <FormControl isRequired>
                            <FormLabel>{lang === "TH" ? "ผู้ใช้งาน" : "User type"}</FormLabel>
                            <Select
                                // placeholder={lang === "TH" ? "เลือกประเภทผู้ใช้งาน" : "Select User Type"}
                                value={form.role || ""}
                                onChange={(e) =>
                                    setForm({ ...form, role: e.target.value })
                                }
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {lang === "TH" ? role.labelTH : role.labelEN}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                            <FormControl isRequired>
                                <FormLabel>{lang === "TH" ? "ชื่อจริง" : "First Name"}</FormLabel>
                                <Input
                                    type="text"
                                    value={form.first_name || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, first_name: e.target.value })
                                    }
                                    placeholder={lang === "TH" ? "ชื่อจริง" : "First Name"}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>{lang === "TH" ? "นามสกุล" : "Last Name"}</FormLabel>
                                <Input
                                    type="text"
                                    value={form.last_name || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, last_name: e.target.value })
                                    }
                                    placeholder={lang === "TH" ? "นามสกุล" : "Last Name"}
                                />
                            </FormControl>

                            <FormControl display={form.role == "student" || form.role == "teacher" ? "block" : "none"} isRequired={form.role == "student" || form.role == "teacher"}>
                                <FormLabel>{lang === "TH" ? "โรงเรียน" : "School"}</FormLabel>
                                <Input
                                    type="text"
                                    value={form.school || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, school: e.target.value })
                                    }
                                    placeholder={lang === "TH" ? "โรงเรียน" : "School"}
                                />
                            </FormControl>

                            <FormControl display={form.role == "student" || form.role == "teacher" ? "block" : "none"} isRequired={form.role == "student" || form.role == "teacher"}>
                                <FormLabel>{lang === "TH" ? "จังหวัด" : "Province"}</FormLabel>
                                <Select
                                    placeholder={lang === "TH" ? "เลือกจังหวัด" : "Select Province"}
                                    value={form.province || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, province: e.target.value })
                                    }
                                >
                                    {provinces.map((p, i) => (
                                        <option key={i} value={p}>{p}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </SimpleGrid>

                        {/* Citizen / Passport */}
                        <FormControl isRequired={form.role == "student"}>
                            <HStack justify="space-between" mb={2}>
                                <FormLabel mb="0">
                                    {usePassport
                                        ? lang === "TH" ? "Passport ID" : "Passport ID"
                                        : lang === "TH" ? "หมายเลขบัตรประชาชน" : "Citizen ID"}
                                </FormLabel>
                                <HStack>
                                    <Text fontSize="sm">ID</Text>
                                    <Switch
                                        required={false}
                                        isChecked={usePassport}
                                        onChange={() => setUsePassport(!usePassport)}
                                        colorScheme="orange"
                                    />
                                    <Text fontSize="sm">Passport</Text>
                                </HStack>
                            </HStack>

                            {!usePassport ? (
                                <Input
                                    type="text"
                                    value={form.citizen_id || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            citizen_id: e.target.value,
                                            passport_id: "", // clear ค่า passport ตอนสลับ
                                        })
                                    }
                                    placeholder={
                                        lang === "TH" ? "เลขบัตรประชาชน 13 หลัก" : "13-digit Citizen ID"
                                    }
                                />
                            ) : (
                                <Input
                                    type="text"
                                    value={form.passport_id || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            passport_id: e.target.value,
                                            citizen_id: "", // clear ค่า citizen ตอนสลับ
                                        })
                                    }
                                    placeholder={
                                        lang === "TH" ? "เลข Passport" : "Passport Number"
                                    }
                                />
                            )}
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>{lang === "TH" ? "อีเมล" : "Email"}</FormLabel>
                            <Input
                                type="email"
                                value={form.email || ""}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="example@email.com"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>{lang === "TH" ? "เบอร์โทรศัพท์" : "Phone"}</FormLabel>
                            <Input
                                type="tel"
                                value={form.phone || ""}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="0812345678"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>{lang === "TH" ? "รหัสผ่าน" : "Password"}</FormLabel>
                            <Input
                                type="password"
                                value={form.password || ""}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                                placeholder="••••••••"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>{lang === "TH" ? "ยืนยันรหัสผ่าน" : "Confirm Password"}</FormLabel>
                            <Input
                                type="password"
                                value={form.confirm_password || ""}
                                onChange={(e) =>
                                    setForm({ ...form, confirm_password: e.target.value })
                                }
                                placeholder="••••••••"
                            />
                        </FormControl>

                        {error && (
                            <Alert status="error" rounded="md">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            bg={PRIMARY}
                            color="white"
                            _hover={{ bg: "#d63e1a" }}
                            w="full"
                            mt={2}
                            isLoading={isLoading}
                            rounded="xl"
                        >
                            {lang === "TH" ? "สมัครสมาชิก" : "Register"}
                        </Button>
                    </VStack>
                </form>

                <Box
                    mt={6}
                    p={4}
                    bg={useColorModeValue("orange.50", "gray.700")}
                    rounded="lg"
                    textAlign="center"
                    fontSize="sm"
                    color={textColor}
                >
                    <Text>
                        {lang === "TH"
                            ? "กรุณาใช้ข้อมูลจริงเพื่อการยืนยันตัวตน"
                            : "Please use real information for verification"}
                    </Text>
                    <Text>
                        {lang === "TH"
                            ? "หลังสมัครสมาชิกสามารถเข้าสู่ระบบผ่านหน้า Login"
                            : "After registration, you can log in on the Login page"}
                    </Text>
                </Box>

                <Text textAlign="center" fontSize="sm" color={textColor} mt={4}>
                    {lang === "TH" ? "มีบัญชีแล้ว?" : "Already have an account?"}{" "}
                    <Text
                        as="span"
                        color={PRIMARY}
                        fontWeight="semibold"
                        cursor="pointer"
                        onClick={() => router.push("/login")}
                    >
                        {lang === "TH" ? "เข้าสู่ระบบ" : "Login"}
                    </Text>
                </Text>
            </Box>
        </Flex>
    )
}
