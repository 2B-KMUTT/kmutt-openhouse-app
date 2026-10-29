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
    FormLabel,
    NumberInput,
    NumberInputField,
    useToast,
    Text,
    Badge,
} from "@chakra-ui/react"
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

    // fetch departments for select dropdown
    useEffect(() => {
        fetch("/api/departments")
            .then(res => res.json())
            .then(data => setDepartments(data))
    }, [])

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then(res => res.json())
                .then(data => setAdminOwners(data))
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
                // reset form
                setTitle("")
                setDescription("")
                setActivityType("workshop")
                setDepartmentId(0)
                setSelectedOwnerId("")
                setDate("")
                setRound(1)
                setStartTime("")
                setEndTime("")
                setLocation("")
                setPoint(1)
                setFormLink("")
                setImageUrl("")
                setMaxParticipants(0)
                // wait 1 second and redirect to /_km/dashboard
                setTimeout(() => {
                    router.push("/_km/dashboard")
                }, 1000)

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
                title: "เกิดข้อผิดพลาด",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    return (
        <KMAppLayout navigation="เพิ่มกิจกรรม">
            <Box mx="auto" mt={4} mb={10} p={3} bg="white" rounded="xl" shadow="sm">
                <VStack spacing={1} align="stretch">
                    <FormLabel>ชื่อกิจกรรม <Text as="span" color="red.500">*</Text></FormLabel>
                    <Input value={title} onChange={e => setTitle(e.target.value)} />

                    <FormLabel>รายละเอียด <Text as="span" color="red.500">*</Text></FormLabel>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} />

                    <FormLabel>ประเภทกิจกรรม <Text as="span" color="red.500">*</Text></FormLabel>
                    <Select value={activityType} onChange={e => setActivityType(e.target.value as ActivityType)}>
                        <option value="workshop">Workshop</option>
                        <option value="regis_activity">Regis Activity</option>
                        <option value="non_regis_activity">Non Regis Activity</option>
                    </Select>

                    {isSuperAdmin && (
                        <Box bg="orange.50" p={3} rounded="xl" borderWidth="1px" borderColor="orange.200" my={2}>
                            <FormLabel fontWeight="bold" color="orange.800" mb={1}>
                                เจ้าของกิจกรรม (Activity Owner) <Badge colorScheme="orange" ml={1}>Super Admin</Badge>
                            </FormLabel>
                            <Select
                                bg="white"
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
                            <Text fontSize="xs" color="gray.600" mt={1}>
                                * กิจกรรมจะถูกบันทึกให้คณะที่เลือก และระบบจะมอบหมาย (Auto-assign) ให้ Staff ประจำคณะนั้นโดยอัตโนมัติ
                            </Text>
                        </Box>
                    )}

                    <FormLabel>หน่วยงาน/สาขาวิชา <Text as="span" color="red.500">*</Text></FormLabel>
                    <Select value={departmentId} onChange={e => setDepartmentId(Number(e.target.value))}>
                        <option value={0}>-- เลือกหน่วยงาน/สาขาวิชา --</option>
                        {departments.map(dep => (
                            <option key={dep.id} value={dep.id}>{dep.name_th}</option>
                        ))}
                    </Select>

                    <HStack spacing={1}>
                        <Box flex={1}>
                            <FormLabel>วันที่จัดกิจกรรม <Text as="span" color="red.500">*</Text></FormLabel>
                            {/* <Input type="date" value={date} onChange={e => setDate(e.target.value)} /> */}
                            <Select placeholder="เลือกวันที่" value={date} onChange={e => setDate(e.target.value)}>
                                <option value="30/10/2026">30 ตุลาคม 2569 (วันจัดงาน)</option>
                            </Select>

                        </Box>

                        <Box flex={1}>
                            <FormLabel>รอบของกิจกรรม</FormLabel>
                            <NumberInput min={1} value={round} onChange={(_, val) => setRound(val)}>
                                <NumberInputField />
                            </NumberInput>
                        </Box>
                    </HStack>

                    <HStack spacing={1}>
                        <Box flex={1}>
                            <FormLabel>เวลาเริ่มกิจกรรม <Text as="span" color="red.500">*</Text></FormLabel>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </Box>

                        <Box flex={1}>
                            <FormLabel>เวลาสิ้นสุดกิจกรรม <Text as="span" color="red.500">*</Text></FormLabel>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </Box>
                    </HStack>

                    <FormLabel>สถานที่จัดกิจกรรม <Text as="span" color="red.500">*</Text></FormLabel>
                    <Input value={location} placeholder="สถานที่จัดกิจกรรม" onChange={e => setLocation(e.target.value)} />

                    <FormLabel>คะแนนของกิจกรรม</FormLabel>
                    <NumberInput min={1} max={3} value={point} defaultValue={1} onChange={(_, val) => setPoint(val)}>
                        <NumberInputField />
                    </NumberInput>

                    <FormLabel>ลิงก์ฟอร์มแบบประเมิน</FormLabel>
                    <Input value={formLink} onChange={e => setFormLink(e.target.value)} />

                    <FormLabel>ลิงก์ภาพกิจกรรม</FormLabel>
                    <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />

                    <FormLabel>จำนวนผู้เข้าร่วมสูงสุด</FormLabel>
                    <NumberInput min={1} value={maxParticipants} onChange={(_, val) => setMaxParticipants(val)}>
                        <NumberInputField />
                    </NumberInput>

                    <Button colorScheme="blue" onClick={handleSubmit}>
                        สร้างกิจกรรม
                    </Button>
                </VStack>
            </Box>
        </KMAppLayout>
    )
}

export default AddActivityPage
