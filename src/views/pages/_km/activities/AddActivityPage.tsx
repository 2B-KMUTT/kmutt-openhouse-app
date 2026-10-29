"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Box,
    Button,
    Input,
    Textarea,
    Select,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    FormHelperText,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    Text,
    Badge,
    SimpleGrid,
    Card,
    CardBody,
    Divider,
    Icon,
} from "@chakra-ui/react"
import { AddIcon, ArrowBackIcon } from "@chakra-ui/icons"
import KMAppLayout from "@/views/layouts/KMAppLayout"
import { useRouter } from "next/router"

type ActivityType = "workshop" | "regis_activity" | "non_regis_activity"

const AddActivityPage = () => {
    const router = useRouter()
    const toast = useToast()
    const { data: session } = useSession()
    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN"

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [activityType, setActivityType] = useState<ActivityType>("workshop")
    const [departmentId, setDepartmentId] = useState<number>(0)
    const [date, setDate] = useState("")
    const [round, setRound] = useState(1)
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [location, setLocation] = useState("")
    const [point, setPoint] = useState(1)
    const [formLink, setFormLink] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [maxParticipants, setMaxParticipants] = useState(0)
    const [departments, setDepartments] = useState<{ id: number, name_th: string, name_en: string }[]>([])
    const [adminOwners, setAdminOwners] = useState<{ id: number, name: string, username: string }[]>([])
    const [selectedOwnerId, setSelectedOwnerId] = useState<number | "">("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // fetch departments for select dropdown
    useEffect(() => {
        fetch("/api/departments")
            .then(res => res.json())
            .then(data => setDepartments(Array.isArray(data) ? data : []))
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then(res => res.json())
                .then(data => setAdminOwners(Array.isArray(data) ? data : []))
                .catch(() => {})
        }
    }, [isSuperAdmin])

    const handleSubmit = async () => {
        const missingFields: string[] = []
        if (!title.trim()) missingFields.push("ชื่อกิจกรรม")
        if (!description.trim()) missingFields.push("รายละเอียด")
        if (!departmentId || departmentId === 0) missingFields.push("หน่วยงาน/สาขาวิชา")
        if (!date) missingFields.push("วันที่จัดกิจกรรม")
        if (!startTime) missingFields.push("เวลาเริ่มกิจกรรม")
        if (!endTime) missingFields.push("เวลาสิ้นสุดกิจกรรม")
        if (!location.trim()) missingFields.push("สถานที่จัดกิจกรรม")

        if (missingFields.length > 0) {
            toast({
                title: "กรอกข้อมูลไม่ครบ",
                description: `กรุณากรอกหรือระบุ: ${missingFields.join(", ")}`,
                status: "error",
                duration: 4000,
                isClosable: true,
            })
            return
        }

        const body: Record<string, any> = {
            title: title.trim(),
            description: description.trim(),
            activity_type: activityType,
            departmentId,
            date,
            round,
            start_time: startTime,
            end_time: endTime,
            location: location.trim(),
            point,
            form_link: formLink.trim(),
            image_url: imageUrl.trim(),
            max_participants: maxParticipants,
        }

        if (isSuperAdmin && selectedOwnerId) {
            body.ownerId = Number(selectedOwnerId)
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/km/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                toast({
                    title: "สร้างกิจกรรมเรียบร้อย",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                })
                router.push("/_km/dashboard")
            } else {
                const data = await res.json().catch(() => null)
                toast({
                    title: "เกิดข้อผิดพลาด",
                    description: data?.message || "ไม่สามารถสร้างกิจกรรมได้",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                })
            }
        } catch (err) {
            toast({
                title: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <KMAppLayout navigation="เพิ่มกิจกรรม">
            <VStack spacing={6} align="stretch">
                {/* Header Actions */}
                <HStack justify="space-between" align="center">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" color="gray.800" _dark={{ color: "gray.100" }}>
                            สร้างกิจกรรมใหม่
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            กรอกรายละเอียดกิจกรรมเพื่อเปิดให้ผู้เข้าร่วมงานลงทะเบียน
                        </Text>
                    </Box>
                    <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<ArrowBackIcon />}
                        onClick={() => router.push("/_km/dashboard")}
                    >
                        ย้อนกลับ
                    </Button>
                </HStack>

                {/* Super Admin Ownership Setting */}
                {isSuperAdmin && (
                    <Card variant="outline" borderColor="orange.200" bg="orange.50" _dark={{ bg: "whiteAlpha.50", borderColor: "orange.700" }}>
                        <CardBody p={4}>
                            <FormControl>
                                <HStack justify="space-between" mb={2}>
                                    <FormLabel mb={0} fontSize="sm" fontWeight="bold" color="gray.800" _dark={{ color: "gray.100" }}>
                                        คณะ / ส่วนงานเจ้าของกิจกรรม
                                    </FormLabel>
                                    <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                        Super Admin Control
                                    </Badge>
                                </HStack>
                                <Select
                                    bg="white"
                                    _dark={{ bg: "gray.800" }}
                                    rounded="lg"
                                    focusBorderColor="orange.500"
                                    value={selectedOwnerId}
                                    onChange={e => setSelectedOwnerId(e.target.value ? Number(e.target.value) : "")}
                                >
                                    <option value="">-- กำหนดเป็นตัวเอง ({session?.user?.name || "Super Admin"}) --</option>
                                    {adminOwners.map(admin => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.name} ({admin.username})
                                        </option>
                                    ))}
                                </Select>
                                <FormHelperText fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                                    กิจกรรมจะถูกบันทึกให้คณะที่เลือก และระบบจะมอบหมายงาน (Auto-assign) ให้ Staff ประจำคณะนั้นโดยอัตโนมัติ
                                </FormHelperText>
                            </FormControl>
                        </CardBody>
                    </Card>
                )}

                {/* Main Form Fields */}
                <VStack spacing={5} align="stretch">
                    {/* General Information */}
                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold">ชื่อกิจกรรม</FormLabel>
                        <Input
                            placeholder="เช่น แนะนำหลักสูตรวิศวกรรมคอมพิวเตอร์และสาธิตโครงงาน"
                            value={title}
                            focusBorderColor="orange.500"
                            rounded="lg"
                            onChange={e => setTitle(e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold">รายละเอียดกิจกรรม</FormLabel>
                        <Textarea
                            placeholder="รายละเอียด ข้อมูลกิจกรรม กำหนดการโดยย่อ หรือสิ่งที่ต้องเตรียมมา"
                            value={description}
                            focusBorderColor="orange.500"
                            rounded="lg"
                            rows={4}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">ประเภทกิจกรรม</FormLabel>
                            <Select
                                value={activityType}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setActivityType(e.target.value as ActivityType)}
                            >
                                <option value="workshop">Workshop (เชิงปฏิบัติการ)</option>
                                <option value="regis_activity">Regis Activity (ต้องลงทะเบียนล่วงหน้า)</option>
                                <option value="non_regis_activity">Non Regis Activity (เข้าร่วมได้ทันที)</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">หน่วยงาน / ภาควิชา</FormLabel>
                            <Select
                                value={departmentId}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setDepartmentId(Number(e.target.value))}
                            >
                                <option value={0}>-- เลือกหน่วยงาน / ภาควิชา --</option>
                                {departments.map(dep => (
                                    <option key={dep.id} value={dep.id}>{dep.name_th}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">วันที่จัดกิจกรรม</FormLabel>
                            <Select
                                placeholder="-- เลือกวันที่ --"
                                value={date}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setDate(e.target.value)}
                            >
                                <option value="30/10/2026">30 ตุลาคม 2569 (วันจัดงาน)</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold">รอบกิจกรรม</FormLabel>
                            <NumberInput
                                min={1}
                                value={round}
                                focusBorderColor="orange.500"
                                onChange={(_, val) => setRound(val || 1)}
                            >
                                <NumberInputField rounded="lg" />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">เวลาเริ่ม</FormLabel>
                            <Input
                                type="time"
                                value={startTime}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">เวลาสิ้นสุด</FormLabel>
                            <Input
                                type="time"
                                value={endTime}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setEndTime(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold">สถานที่จัดกิจกรรม</FormLabel>
                            <Input
                                placeholder="เช่น อาคารเรียนรวม 2 ชั้น 3 ห้อง 301"
                                value={location}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setLocation(e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold">คะแนนกิจกรรม (E-Stamp Points)</FormLabel>
                            <NumberInput
                                min={1}
                                max={5}
                                value={point}
                                focusBorderColor="orange.500"
                                onChange={(_, val) => setPoint(val || 1)}
                            >
                                <NumberInputField rounded="lg" />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold">จำนวนผู้เข้าร่วมสูงสุด (คน)</FormLabel>
                            <NumberInput
                                min={0}
                                value={maxParticipants}
                                focusBorderColor="orange.500"
                                onChange={(_, val) => setMaxParticipants(val || 0)}
                            >
                                <NumberInputField rounded="lg" placeholder="0 = ไม่จำกัดจำนวน" />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <FormHelperText fontSize="xs">ใส่ 0 หากไม่มีการจำกัดจำนวนผู้เข้าร่วม</FormHelperText>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold">ลิงก์ภาพกิจกรรม (Image URL)</FormLabel>
                            <Input
                                placeholder="https://example.com/banner.jpg"
                                value={imageUrl}
                                focusBorderColor="orange.500"
                                rounded="lg"
                                onChange={e => setImageUrl(e.target.value)}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">ลิงก์ฟอร์มแบบประเมินกิจกรรม (Google Forms / MS Forms)</FormLabel>
                        <Input
                            placeholder="https://forms.gle/..."
                            value={formLink}
                            focusBorderColor="orange.500"
                            rounded="lg"
                            onChange={e => setFormLink(e.target.value)}
                        />
                    </FormControl>

                    <Divider my={2} />

                    {/* Action Buttons */}
                    <HStack justify="flex-end" spacing={3}>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/_km/dashboard")}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            colorScheme="orange"
                            leftIcon={<AddIcon />}
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                            loadingText="กำลังสร้าง..."
                        >
                            สร้างกิจกรรม
                        </Button>
                    </HStack>
                </VStack>
            </VStack>
        </KMAppLayout>
    )
}

export default AddActivityPage