import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
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
    Text,
    Badge,
} from "@chakra-ui/react";
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

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // โหลด staff list
    const fetchStaffs = async (adminId?: number | "") => {
        const query = adminId ? `?adminId=${adminId}` : "";
        const res = await fetch(`/api/km/staff${query}`);
        const data = await res.json();
        setStaffs(Array.isArray(data) ? data : []);
    };

    // โหลด activities
    const fetchActivities = async () => {
        const res = await fetch("/api/km/activities");
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then((res) => res.json())
                .then((data) => setAdminOwners(data))
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

    // ฟอร์มสร้าง staff
    const handleCreateStaff = async () => {
        if (!form.username || !form.password || !form.name || !form.email) {
            toast({ status: "warning", title: "กรอกข้อมูลให้ครบก่อน" });
            return;
        }

        const body: Record<string, any> = {
            username: form.username,
            password: form.password,
            name: form.name,
            email: form.email,
        };

        if (isSuperAdmin && form.adminId) {
            body.adminId = Number(form.adminId);
        }

        const res = await fetch("/api/km/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            toast({ status: "success", title: "สร้าง Staff สำเร็จ" });
            setForm({ username: "", password: "", name: "", email: "", adminId: "" });
            fetchStaffs(selectedAdminFilter);
        } else {
            toast({ status: "error", title: "ไม่สามารถสร้าง Staff ได้" });
        }
    };

    // เปิด modal assign activities
    const handleOpenAssign = async (staff: Staff) => {
        setSelectedStaff(staff);
        setLoadingMapping(true);
        onOpen();

        try {
            const res = await fetch(`/api/km/staff/mapping?staffId=${staff.id}`);
            const data: number[] = await res.json();
            setSelectedActivities(data);
        } catch (err) {
            console.error(err);
            toast({ status: "error", title: "โหลดกิจกรรมไม่สำเร็จ" });
        } finally {
            setLoadingMapping(false);
        }
    };

    // assign activities
    const handleAssign = async () => {
        if (!selectedStaff) return;

        const res = await fetch(`/api/km/staff/mapping`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ staffId: selectedStaff.id, activityIds: selectedActivities }),
        });

        if (res.ok) {
            toast({ status: "success", title: "บันทึกกิจกรรมให้ Staff แล้ว" });
            onClose();
            setSelectedActivities([]);
        } else {
            toast({ status: "error", title: "บันทึกไม่สำเร็จ" });
        }
    };

    return (
        <KMAppLayout navigation="Staff Management">
            <Box bg="white" p={4} rounded="xl" shadow="md">
                <HStack spacing={3} wrap="wrap">
                    <Input
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        size="sm"
                        flex="1"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        size="sm"
                        flex="1"
                    />
                    <Input
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        size="sm"
                        flex="1"
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        size="sm"
                        flex="1"
                    />
                    {isSuperAdmin && (
                        <Select
                            placeholder="เลือกคณะ/สังกัด"
                            value={form.adminId}
                            onChange={(e) => setForm({ ...form, adminId: e.target.value ? Number(e.target.value) : "" })}
                            size="sm"
                            flex="1.5"
                        >
                            {adminOwners.map((admin) => (
                                <option key={admin.id} value={admin.id}>
                                    {admin.name} ({admin.username})
                                </option>
                            ))}
                        </Select>
                    )}
                    <Button colorScheme="orange" onClick={handleCreateStaff} size="sm">
                        Create
                    </Button>
                </HStack>
            </Box>

            {isSuperAdmin && (
                <Box mt={6} p={3} bg="orange.50" rounded="xl" borderWidth="1px" borderColor="orange.200">
                    <HStack justify="space-between" align="center" mb={1}>
                        <Text fontSize="xs" fontWeight="bold" color="orange.800">
                            👑 กรองรายชื่อ Staff ตามคณะ/หน่วยงาน (Super Admin Mode)
                        </Text>
                        {selectedAdminFilter && (
                            <Button size="xs" variant="ghost" colorScheme="orange" onClick={() => handleAdminFilterChange("")}>
                                ล้างตัวกรอง
                            </Button>
                        )}
                    </HStack>
                    <Select
                        size="sm"
                        bg="white"
                        value={selectedAdminFilter}
                        onChange={(e) => handleAdminFilterChange(e.target.value)}
                    >
                        <option value="">-- แสดง Staff ของทุกคณะ (ทั้งหมด) --</option>
                        {adminOwners.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                                {admin.name} ({admin.username})
                            </option>
                        ))}
                    </Select>
                </Box>
            )}

            <Box mt={isSuperAdmin ? 4 : 8}>
                <Table variant="simple" bg="white" shadow="sm" rounded="xl">
                    <Thead bg="orange.500">
                        <Tr>
                            <Th color="white">Name</Th>
                            <Th color="white">Username</Th>
                            <Th color="white">Email</Th>
                            {isSuperAdmin && <Th color="white">สังกัด (Faculty)</Th>}
                            <Th color="white">Created</Th>
                            <Th color="white">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {staffs.map((staff) => (
                            <Tr key={staff.id}>
                                <Td>{staff.name}</Td>
                                <Td>{staff.username}</Td>
                                <Td>{staff.email}</Td>
                                {isSuperAdmin && (
                                    <Td>
                                        <Badge colorScheme="purple">
                                            {staff.created_by?.name || "ส่วนกลาง"}
                                        </Badge>
                                    </Td>
                                )}
                                <Td>{new Date(staff.created_at).toLocaleDateString()}</Td>
                                <Td>
                                    <Button
                                        size="sm"
                                        colorScheme="teal"
                                        onClick={() => handleOpenAssign(staff)}
                                    >
                                        Assign Activities
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {/* Modal Assign */}
            {/* Modal Assign */}
            <Modal isOpen={isOpen} onClose={onClose} size="5xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Assign Activities to {selectedStaff?.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {activities.map((act) => {
                            const id = Number(act.id); // cast เป็น number
                            const isChecked = selectedActivities.includes(id); // now it's safe

                            return (
                                <Box key={id}>
                                    <Checkbox
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
                                        {act.title} ({new Date(act.date).toLocaleDateString()} {act.start_time})
                                    </Checkbox>
                                </Box>
                            );
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="orange" mr={3} onClick={handleAssign}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </KMAppLayout>
    );
};

export { KMStaff };
