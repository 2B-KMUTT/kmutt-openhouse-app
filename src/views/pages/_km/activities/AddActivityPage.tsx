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
    SimpleGrid,
    useColorModeValue,
} from "@chakra-ui/react"
import { AddIcon } from "@chakra-ui/icons"
import KMAppLayout from "@/views/layouts/KMAppLayout"
import { useRouter } from "next/router"

type ActivityType = "workshop" | "regis_activity" | "non_regis_activity"

const AddActivityPage = () => {
    const router = useRouter()
    const toast = useToast()
    const { data: session } = useSession()
    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN"
    const borderColor = useColorModeValue("gray.200", "gray.600")

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
                description: `กรุณากรอก: ${missingFields.join(", ")}`,
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
            <VStack spacing={4} align="stretch">
                {/* Super Admin Ownership Field */}
                {isSuperAdmin && (
                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">
                            สังกัดคณะ / เจ้าของกิจกรรม (Super Admin)
                        </FormLabel>
                        <Select
                            size="sm"
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
                        <FormHelperText fontSize="xs">
                            กิจกรรมจะถูกบันทึกให้คณะที่เลือก และระบบจะมอบหมายให้ Staff ประจำคณะนั้นโดยอัตโนมัติ
                        </FormHelperText>
                    </FormControl>
                )}

                <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="semibold">ชื่อกิจกรรม</FormLabel>
                    <Input
                        size="sm"
                        rounded="lg"
                        placeholder="ชื่อกิจกรรม"
                        value={title}
                        focusBorderColor="orange.500"
                        onChange={e => setTitle(e.target.value)}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="semibold">รายละเอียด</FormLabel>
                    <Textarea
                        size="sm"
                        rounded="lg"
                        placeholder="รายละเอียดกิจกรรม"
                        value={description}
                        focusBorderColor="orange.500"
                        rows={3}
                        onChange={e => setDescription(e.target.value)}
                    />
                </FormControl>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="semibold">ประเภทกิจกรรม</FormLabel>
                        <Select
                            size="sm"
                            rounded="lg"
                            value={activityType}
                            focusBorderColor="orange.500"
                            onChange={e => setActivityType(e.target.value as ActivityType)}
                        >
                            <option value="workshop">Workshop</option>
                            <option value="regis_activity">Regis Activity</option>
                            <option value="non_regis_activity">Non Regis Activity</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="semibold">หน่วยงาน / ภาควิชา</FormLabel>
                        <Select
                            size="sm"
                            rounded="lg"
                            value={departmentId}
                            focusBorderColor="orange.500"
                            onChange={e => setDepartmentId(Number(e.target.value))}
                        >
                            <option value={0}>-- เลือกหน่วยงาน / ภาควิชา --</option>
                            {departments.map(dep => (
                                <option key={dep.id} value={dep.id}>{dep.name_th}</option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="semibold">วันที่จัดกิจกรรม</FormLabel>
                        <Select
                            size="sm"
                            rounded="lg"
                            placeholder="-- เลือกวันที่ --"
                            value={date}
                            focusBorderColor="orange.500"
                            onChange={e => setDate(e.target.value)}
                        >
                            <option value="30/10/2026">30 ตุลาคม 2569</option>
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="semibold">รอบกิจกรรม</FormLabel>
                        <NumberInput
                            size="sm"
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
                        <FormLabel fontSize="xs" fontWeight="semibold">เวลาเริ่ม</FormLabel>
                        <Input
                            size="sm"
                            rounded="lg"
                            type="time"
                            value={startTime}
                            focusBorderColor="orange.500"
                            onChange={e => setStartTime(e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="semibold">เวลาสิ้นสุด</FormLabel>
                        <Input
                            size="sm"
                            rounded="lg"
                            type="time"
                            value={endTime}
                            focusBorderColor="orange.500"
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="semibold">สถานที่จัดกิจกรรม</FormLabel>
                        <Input
                            size="sm"
                            rounded="lg"
                            placeholder="สถานที่จัดกิจกรรม"
                            value={location}
                            focusBorderColor="orange.500"
                            onChange={e => setLocation(e.target.value)}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="semibold">คะแนน (E-Stamp Points)</FormLabel>
                        <NumberInput
                            size="sm"
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
                        <FormLabel fontSize="xs" fontWeight="semibold">จำนวนผู้เข้าร่วมสูงสุด (คน)</FormLabel>
                        <NumberInput
                            size="sm"
                            min={0}
                            value={maxParticipants}
                            focusBorderColor="orange.500"
                            onChange={(_, val) => setMaxParticipants(val || 0)}
                        >
                            <NumberInputField rounded="lg" placeholder="0 = ไม่จำกัด" />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </FormControl>

                    <FormControl>
                        <FormLabel fontSize="xs" fontWeight="semibold">ลิงก์ภาพกิจกรรม (Image URL)</FormLabel>
                        <Input
                            size="sm"
                            rounded="lg"
                            placeholder="https://..."
                            value={imageUrl}
                            focusBorderColor="orange.500"
                            onChange={e => setImageUrl(e.target.value)}
                        />
                    </FormControl>
                </SimpleGrid>

                <FormControl>
                    <FormLabel fontSize="xs" fontWeight="semibold">ลิงก์แบบประเมิน (Form Link)</FormLabel>
                    <Input
                        size="sm"
                        rounded="lg"
                        placeholder="https://..."
                        value={formLink}
                        focusBorderColor="orange.500"
                        onChange={e => setFormLink(e.target.value)}
                    />
                </FormControl>

                <HStack justify="flex-end" spacing={3} pt={4} borderTop="1px solid" borderColor={borderColor}>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/_km/dashboard")}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        size="sm"
                        colorScheme="orange"
                        leftIcon={<AddIcon />}
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        loadingText="กำลังบันทึก..."
                    >
                        สร้างกิจกรรม
                    </Button>
                </HStack>
            </VStack>
        </KMAppLayout>
    )
}

export default AddActivityPage