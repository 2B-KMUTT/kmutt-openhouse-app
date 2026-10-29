"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    Button,
    FormControl,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Checkbox,
    useDisclosure,
    useToast,
    Spinner,
    HStack,
    VStack,
    Text,
    Badge,
    SimpleGrid,
    Flex,
    useColorModeValue,
    Divider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import KMAppLayout from "@/views/layouts/KMAppLayout";

type Staff = {
    id: number;
    username: string;
    name: string;
    email: string;
    created_at: string;
    created_by?: {
        id: number;
        name: string;
        username: string;
    } | null;
};

type Activity = {
    id: number;
    title: string;
    date: string;
    start_time: string;
};

const KMStaff = () => {
    const { data: session } = useSession();
    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN";

    const borderColor = useColorModeValue("gray.200", "gray.600");
    const headerBg = useColorModeValue("gray.50", "gray.800");

    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
    const [adminOwners, setAdminOwners] = useState<{ id: number, name: string, username: string }[]>([]);
    const [selectedAdminFilter, setSelectedAdminFilter] = useState<number | "">("");

    const [form, setForm] = useState({
        username: "",
        password: "",
        name: "",
        email: "",
        adminId: "" as number | "",
    });
    const [loadingMapping, setLoadingMapping] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const fetchStaffs = async (adminId?: number | "") => {
        const query = adminId ? `?adminId=${adminId}` : "";
        const res = await fetch(`/api/km/staff${query}`);
        const data = await res.json();
        setStaffs(Array.isArray(data) ? data : []);
    };

    const fetchActivities = async () => {
        const res = await fetch("/api/km/activities");
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then((res) => res.json())
                .then((data) => setAdminOwners(Array.isArray(data) ? data : []))
                .catch(() => {});
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        fetchStaffs();
        fetchActivities();
    }, []);

    const handleAdminFilterChange = (val: string) => {
        const adminId = val ? Number(val) : "";
        setSelectedAdminFilter(adminId);
        fetchStaffs(adminId);
    };

    const handleCreateStaff = async () => {
        if (!form.username || !form.password || !form.name || !form.email) {
            toast({ status: "warning", title: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
            return;
        }

        const body: Record<string, any> = {
            username: form.username.trim(),
            password: form.password,
            name: form.name.trim(),
            email: form.email.trim(),
        };

        if (isSuperAdmin && form.adminId) {
            body.adminId = Number(form.adminId);
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/km/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast({ status: "success", title: "สร้างบัญชี Staff สำเร็จ" });
                setForm({ username: "", password: "", name: "", email: "", adminId: "" });
                fetchStaffs(selectedAdminFilter);
            } else {
                const data = await res.json().catch(() => null);
                toast({ status: "error", title: data?.message || "ไม่สามารถสร้าง Staff ได้" });
            }
        } catch (err) {
            toast({ status: "error", title: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenAssign = async (staff: Staff) => {
        setSelectedStaff(staff);
        setLoadingMapping(true);
        onOpen();

        try {
            const res = await fetch(`/api/km/staff/mapping?staffId=${staff.id}`);
            const data: number[] = await res.json();
            setSelectedActivities(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast({ status: "error", title: "โหลดรายการกิจกรรมไม่สำเร็จ" });
        } finally {
            setLoadingMapping(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStaff) return;

        const res = await fetch(`/api/km/staff/mapping`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ staffId: selectedStaff.id, activityIds: selectedActivities }),
        });

        if (res.ok) {
            toast({ status: "success", title: "บันทึกการมอบหมายกิจกรรมแล้ว" });
            onClose();
            setSelectedActivities([]);
        } else {
            toast({ status: "error", title: "บันทึกไม่สำเร็จ" });
        }
    };

    return (
        <KMAppLayout navigation="Staff Management">
            <VStack spacing={5} align="stretch">
                {/* Flat Create Staff Strip */}
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" fontWeight="bold">
                            เพิ่มบัญชี Staff
                        </Text>
                        {isSuperAdmin && (
                            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                Super Admin Mode
                            </Badge>
                        )}
                    </HStack>
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: isSuperAdmin ? 5 : 4 }} spacing={2.5}>
                        <FormControl isRequired>
                            <Input
                                placeholder="Username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                size="sm"
                                rounded="lg"
                                focusBorderColor="orange.500"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                size="sm"
                                rounded="lg"
                                focusBorderColor="orange.500"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <Input
                                placeholder="ชื่อ-นามสกุล"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                size="sm"
                                rounded="lg"
                                focusBorderColor="orange.500"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <Input
                                type="email"
                                placeholder="อีเมล"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                size="sm"
                                rounded="lg"
                                focusBorderColor="orange.500"
                            />
                        </FormControl>
                        {isSuperAdmin && (
                            <FormControl>
                                <Select
                                    placeholder="สังกัดคณะ (เป็นตัวเอง)"
                                    value={form.adminId}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            adminId: e.target.value ? Number(e.target.value) : "",
                                        })
                                    }
                                    size="sm"
                                    rounded="lg"
                                    focusBorderColor="orange.500"
                                >
                                    {adminOwners.map((admin) => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.name} ({admin.username})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </SimpleGrid>

                    <HStack justify="flex-end" mt={2}>
                        <Button
                            colorScheme="orange"
                            size="sm"
                            leftIcon={<AddIcon />}
                            onClick={handleCreateStaff}
                            isLoading={isCreating}
                        >
                            สร้าง Staff
                        </Button>
                    </HStack>
                </Box>

                <Divider />

                {/* Flat Staff List Header & Filter */}
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    gap={3}
                >
                    <Text fontSize="xs" fontWeight="bold">
                        รายชื่อ Staff ({staffs.length} คน)
                    </Text>

                    {isSuperAdmin && (
                        <HStack spacing={2} align="center">
                            <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                                คณะ:
                            </Text>
                            <Select
                                size="sm"
                                rounded="lg"
                                focusBorderColor="orange.500"
                                maxW="220px"
                                value={selectedAdminFilter}
                                onChange={(e) => handleAdminFilterChange(e.target.value)}
                            >
                                <option value="">ทุกคณะ (ทั้งหมด)</option>
                                {adminOwners.map((admin) => (
                                    <option key={admin.id} value={admin.id}>
                                        {admin.name} ({admin.username})
                                    </option>
                                ))}
                            </Select>
                            {selectedAdminFilter && (
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="orange"
                                    onClick={() => handleAdminFilterChange("")}
                                >
                                    ล้าง
                                </Button>
                            )}
                        </HStack>
                    )}
                </Flex>

                {/* Direct Flat Table */}
                {staffs.length === 0 ? (
                    <Box py={8} textAlign="center" color="gray.500">
                        <Text fontSize="xs">ไม่พบรายชื่อ Staff</Text>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table variant="simple" size="sm">
                            <Thead bg={headerBg}>
                                <Tr>
                                    <Th fontSize="xs">ชื่อ-สกุล</Th>
                                    <Th fontSize="xs">Username</Th>
                                    <Th fontSize="xs">อีเมล</Th>
                                    {isSuperAdmin && <Th fontSize="xs">สังกัดคณะ</Th>}
                                    <Th fontSize="xs">วันที่สร้าง</Th>
                                    <Th fontSize="xs" textAlign="right">จัดการ</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {staffs.map((staff) => (
                                    <Tr key={staff.id}>
                                        <Td fontWeight="medium">{staff.name}</Td>
                                        <Td color="gray.600" _dark={{ color: "gray.300" }}>{staff.username}</Td>
                                        <Td>{staff.email}</Td>
                                        {isSuperAdmin && (
                                            <Td>
                                                <Badge variant="subtle" colorScheme="orange" fontSize="xs">
                                                    {staff.created_by?.name || "ส่วนกลาง"}
                                                </Badge>
                                            </Td>
                                        )}
                                        <Td color="gray.500">
                                            {new Date(staff.created_at).toLocaleDateString("th-TH")}
                                        </Td>
                                        <Td textAlign="right">
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme="orange"
                                                onClick={() => handleOpenAssign(staff)}
                                            >
                                                มอบหมายกิจกรรม
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}

                {/* Modal Assign Activities */}
                <Modal isOpen={isOpen} onClose={onClose} size="md">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader fontSize="sm">
                            มอบหมายกิจกรรมให้ {selectedStaff?.name}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody maxH="55vh" overflowY="auto">
                            {loadingMapping ? (
                                <HStack justify="center" py={6}>
                                    <Spinner size="sm" color="orange.500" />
                                </HStack>
                            ) : activities.length === 0 ? (
                                <Text fontSize="xs" color="gray.500">
                                    ไม่มีกิจกรรมในระบบ
                                </Text>
                            ) : (
                                <VStack align="stretch" spacing={2}>
                                    {activities.map((act) => {
                                        const id = Number(act.id);
                                        const isChecked = selectedActivities.includes(id);

                                        return (
                                            <Box
                                                key={id}
                                                p={2.5}
                                                border="1px solid"
                                                borderColor={isChecked ? "orange.300" : borderColor}
                                                bg={isChecked ? useColorModeValue("orange.50", "whiteAlpha.50") : "transparent"}
                                                rounded="md"
                                            >
                                                <Checkbox
                                                    colorScheme="orange"
                                                    isChecked={isChecked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedActivities((prev) => [...prev, id]);
                                                        } else {
                                                            setSelectedActivities((prev) =>
                                                                prev.filter((x) => x !== id)
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Box ml={1}>
                                                        <Text fontSize="xs" fontWeight="semibold">
                                                            #{act.id} {act.title}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            📅 {act.date} • ⏰ {act.start_time}
                                                        </Text>
                                                    </Box>
                                                </Checkbox>
                                            </Box>
                                        );
                                    })}
                                </VStack>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="outline" size="sm" mr={3} onClick={onClose}>
                                ยกเลิก
                            </Button>
                            <Button colorScheme="orange" size="sm" onClick={handleAssign}>
                                บันทึก
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </KMAppLayout>
    );
};

export { KMStaff };