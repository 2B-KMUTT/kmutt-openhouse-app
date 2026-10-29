"use client"

import { useState } from "react"
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    Text,
    TableContainer,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react"
import StaffAppLayout from "@/views/layouts/StaffAppLayout"
import { SettingsIcon } from "@chakra-ui/icons"

type Student = {
    id: string
    first_name: string
    last_name: string
    email: string
}

const StudentSetting = () => {
    const toast = useToast()
    const borderColor = useColorModeValue("gray.200", "gray.600")
    const tableHeaderBg = useColorModeValue("orange.50", "gray.800")
    const rowHoverBg = useColorModeValue("gray.50", "whiteAlpha.50")
    const [search, setSearch] = useState("")
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [newPassword, setNewPassword] = useState("")
    const [saving, setSaving] = useState(false)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleSearch = async () => {
        if (!search.trim()) return
        setLoading(true)
        try {
            const res = await fetch(`/api/staff/search-students?query=${encodeURIComponent(search)}`)
            const data = await res.json()
            setStudents(data.students ?? [])
        } catch {
            toast({ title: "เกิดข้อผิดพลาดในการค้นหา", status: "error" })
        } finally {
            setLoading(false)
        }
    }

    const handleResetClick = (student: Student) => {
        setSelectedStudent(student)
        setNewPassword("")
        onOpen()
    }

    const handleSave = async () => {
        if (!newPassword.trim()) {
            toast({ title: "กรุณากรอกรหัสผ่านใหม่", status: "warning" })
            return
        }

        setSaving(true)
        try {
            const res = await fetch("/api/staff/reset-student-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedStudent?.id, newPassword }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "ไม่สามารถรีเซ็ตรหัสผ่านได้")
            }

            toast({ title: "รีเซ็ตรหัสผ่านสำเร็จ", status: "success" })
            onClose()
        } catch (err: unknown) {
            toast({ title: (err as Error).message, status: "error" })
        } finally {
            setSaving(false)
        }
    }

    return (
        <StaffAppLayout navigation="ตั้งค่ารหัสผ่านนักเรียน">
            <Box p={4}>
                <VStack align="stretch" spacing={4}>
                    <HStack>
                        <Input
                            placeholder="ค้นหาอีเมลนักเรียน เช่น student@kmutt.ac.th"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            bg="white"
                        />
                        <Button colorScheme="orange" onClick={handleSearch}>
                            ค้นหา
                        </Button>
                    </HStack>

                    {loading ? (
                        <Spinner alignSelf="center" />
                    ) : students.length === 0 ? (
                        <Text textAlign="center" color="gray.500">
                            🔍 ยังไม่มีผลลัพธ์การค้นหา
                        </Text>
                    ) : (
                        <>
                            {/* Mobile Cards */}
                            <VStack spacing={3} align="stretch" display={{ base: "flex", md: "none" }}>
                                {students.map((student) => (
                                    <Box
                                        key={student.id}
                                        p={3.5}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        rounded="xl"
                                        bg={tableHeaderBg}
                                        shadow="sm"
                                    >
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <Box>
                                                <Text fontWeight="semibold" fontSize="sm">
                                                    {student.first_name} {student.last_name}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500" wordBreak="break-all">
                                                    {student.email}
                                                </Text>
                                            </Box>
                                        </Flex>
                                        <Button
                                            size="sm"
                                            w="full"
                                            colorScheme="orange"
                                            variant="outline"
                                            leftIcon={<SettingsIcon />}
                                            onClick={() => handleResetClick(student)}
                                        >
                                            ตั้งรหัสผ่านใหม่
                                        </Button>
                                    </Box>
                                ))}
                            </VStack>

                            {/* Desktop Table */}
                            <Box
                                display={{ base: "none", md: "block" }}
                                border="1px solid"
                                borderColor={borderColor}
                                rounded="xl"
                                overflow="hidden"
                                shadow="sm"
                            >
                                <TableContainer overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead bg={tableHeaderBg}>
                                            <Tr>
                                                <Th fontSize="xs" py={3}>ชื่อ-นามสกุล</Th>
                                                <Th fontSize="xs" py={3}>อีเมล</Th>
                                                <Th fontSize="xs" py={3} textAlign="right" width="130px">จัดการ</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {students.map((student) => (
                                                <Tr
                                                    key={student.id}
                                                    _hover={{ bg: rowHoverBg }}
                                                    transition="background 0.15s ease"
                                                >
                                                    <Td fontWeight="medium" py={3} fontSize="sm">
                                                        {student.first_name} {student.last_name}
                                                    </Td>
                                                    <Td fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} py={3}>
                                                        {student.email}
                                                    </Td>
                                                    <Td textAlign="right" py={3} whiteSpace="nowrap">
                                                        <Button
                                                            size="xs"
                                                            colorScheme="orange"
                                                            variant="outline"
                                                            leftIcon={<SettingsIcon />}
                                                            onClick={() => handleResetClick(student)}
                                                        >
                                                            ตั้งรหัสผ่าน
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </>
                    )}
                </VStack>

                {/* Modal ตั้งรหัสผ่านใหม่ */}
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>รีเซ็ตรหัสผ่าน</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text fontSize={"md"} mb={2}>สำหรับ {selectedStudent?.first_name} {selectedStudent?.last_name}</Text>
                            <Input
                                placeholder="กรอกรหัสผ่านใหม่"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                ยกเลิก
                            </Button>
                            <Button
                                colorScheme="orange"
                                onClick={handleSave}
                                isLoading={saving}
                            >
                                บันทึก
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </StaffAppLayout>
    )
}

export default StudentSetting
