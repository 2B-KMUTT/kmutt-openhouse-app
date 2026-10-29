// pages/km/activities/[id].tsx  (หรือไฟล์ที่คุณมี ViewActivityPage)
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    Text,
    Spinner,
    Badge,
    HStack,
    Divider,
    Button,
    Input,
    Textarea,
    NumberInput,
    NumberInputField,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    VStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from "@chakra-ui/react";

import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from "@chakra-ui/react";

import * as XLSX from "xlsx";
import KMAppLayout from "@/views/layouts/KMAppLayout";
import { Activity } from "@/interfaces/Activities";

interface Estamp {
    id: number;
    studentName: string;
    email: string;
    phone: string;
    stampBy: string;
    stampedByName?: string;
    issued_at: string;
    rating?: number | null;
    feedback?: string | null;
}

interface Feedback {
    id: number;
    studentName: string;
    rating?: number | null;
    feedback?: string | null;
    issued_at: string;
}

interface SurveySummary {
    ratingCounts: Record<string, number>;
    averageRating?: number | null;
    ratingCounted?: number;
    feedbacks: Feedback[];
}

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    LabelList,
} from "recharts";

export const ViewActivityPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { data: session } = useSession();
    const isSuperAdmin = session?.user?.adminRole === "SUPER_ADMIN";

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState<Partial<Activity>>({});
    const [adminOwners, setAdminOwners] = useState<{ id: number; name: string; username: string }[]>([]);

    // Estamp + survey states
    const [estamps, setEstamps] = useState<Estamp[]>([]);
    const [surveySummary, setSurveySummary] = useState<SurveySummary | null>(null);
    const [loadingEstamps, setLoadingEstamps] = useState<boolean>(false);

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then((res) => res.json())
                .then((data) => setAdminOwners(data))
                .catch(() => {});
        }
    }, [isSuperAdmin]);

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้? การลบนี้จะไม่สามารถย้อนกลับได้")) {
            return;
        }

        try {
            const res = await fetch(`/api/km/activities/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("ลบกิจกรรมสำเร็จ");
                router.push("/_km/dashboard");
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.message || "ไม่สามารถลบกิจกรรมได้");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการลบกิจกรรม");
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchActivity = async () => {
            try {
                const res = await fetch(`/api/km/activities/${id}`);
                const data = await res.json();
                if (res.status === 200) {
                    setActivity(data);
                    setForm(data);
                } else {
                    setActivity(null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
        fetchEstamps(); // also fetch estamps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchEstamps = async () => {
        if (!id) return;
        setLoadingEstamps(true);
        try {
            const res = await fetch(`/api/km/activities/${id}/estamps`);
            if (!res.ok) {
                setEstamps([]);
                setSurveySummary(null);
            } else {
                const data = await res.json();
                setEstamps(data.estamps || []);
                setSurveySummary(data.surveySummary || null);
            }
        } catch (err) {
            console.error("fetchEstamps err", err);
        } finally {
            setLoadingEstamps(false);
        }
    };

    const handleSave = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/km/activities/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const updated = await res.json();
                setActivity(updated);
                setForm(updated);
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const exportExcel = () => {
        if (!activity?.registrations) return;

        const wb = XLSX.utils.book_new();

        // --- ข้อมูลกิจกรรม ---
        const activityInfo = [
            { Key: "ชื่อกิจกรรม", Value: activity.title },
            { Key: "รายละเอียด", Value: activity.description },
            { Key: "วันที่", Value: activity.date },
            { Key: "เวลาเริ่ม", Value: activity.start_time },
            { Key: "เวลาสิ้นสุด", Value: activity.end_time },
            { Key: "สถานที่", Value: activity.location },
            { Key: "คะแนน", Value: activity.point },
            { Key: "จำนวนผู้ลงทะเบียนสูงสุด", Value: activity.max_participants },
        ];

        const wsActivity = XLSX.utils.json_to_sheet(activityInfo, { header: ["Key", "Value"] });

        const studentRows = activity.registrations.map((reg) => ({
            "ชื่อ-สกุล": `${reg.student.first_name} ${reg.student.last_name}`,
            Email: reg.student.email,
            เบอร์โทร: reg.student.phone,
            "เวลาลงทะเบียน": new Date(reg.registered_at).toLocaleString("th-TH"),
        }));

        XLSX.utils.sheet_add_aoa(wsActivity, [[""]], { origin: -1 });
        XLSX.utils.sheet_add_aoa(wsActivity, [["ชื่อ-สกุล", "Email", "เบอร์โทร", "เวลาลงทะเบียน"]], { origin: -1 });
        XLSX.utils.sheet_add_json(wsActivity, studentRows, { skipHeader: true, origin: -1 });

        XLSX.utils.book_append_sheet(wb, wsActivity, "Registrations");
        XLSX.writeFile(wb, `${activity.title}-registrations.xlsx`);
    };

    return (
        <KMAppLayout navigation={`Activity / ${id}`}>
            {loading ? (
                <HStack justify="center" py={10}>
                    <Spinner size="xl" />
                </HStack>
            ) : !activity ? (
                <Text color="red.500" fontSize={"lg"}>
                    Activity not found
                </Text>
            ) : (
                <>
                    <Box p={4} bg="white" _dark={{ bg: "gray.700" }} rounded="xl" shadow="sm">
                        <Badge display={!activity.display ? "block" : "none"} colorScheme={activity.display ? "blue" : "red"} p={4} mb={2} w={"full"} fontSize={"md"}>
                            {activity.display ? "แสดง" : "กิจกรรมนี้ถูกซ่อนอยู่ (ไม่แสดงในหน้ากิจกรรม)"}
                        </Badge>

                        <HStack justify="space-between" mb={2} wrap="wrap">
                            <HStack spacing={2} wrap="wrap">
                                <Text fontSize="md" fontWeight="bold">
                                    #{activity.id} - {activity.title}
                                </Text>
                                {activity.owner && isSuperAdmin && (
                                    <Badge colorScheme="purple" fontSize="xs">
                                        👑 เจ้าของ: {activity.owner.name} ({activity.owner.username})
                                    </Badge>
                                )}
                            </HStack>
                            <HStack spacing={2}>
                                <Button size="sm" colorScheme="yellow" onClick={onOpen}>
                                    แก้ไข
                                </Button>
                                <Button size="sm" colorScheme="red" variant="outline" onClick={handleDelete}>
                                    ลบกิจกรรม
                                </Button>
                            </HStack>
                        </HStack>

                        <Text fontSize="md" color="gray.600" _dark={{ color: "gray.300" }} mb={2}>
                            {activity.description}
                        </Text>

                        <Text fontSize="md" color="gray.500" mb={0}>
                            สถานที่: {activity.location} | คณะ: {activity.faculty?.name_th} - ภาควิชา: {activity.department?.name_th}
                        </Text>

                        <Text fontSize="md" color="gray.500" mb={0}>
                            วันที่: {activity.date} | เวลา: {activity.start_time} - {activity.end_time}
                        </Text>

                        <HStack mt={0} spacing={4}>
                            <Text fontSize="md" color="gray.500">
                                คะแนน: {activity.point}
                            </Text>
                            <Text fontSize="md" color="orange.500">
                                จำนวนผู้ลงทะเบียน: {activity.current_register_participants} / {activity.max_participants}
                            </Text>
                        </HStack>

                        {activity.form_link && (
                            <Text mt={2} fontSize="md" color="blue.500">
                                แบบสอบถาม:{" "}
                                <a href={activity.form_link} target="_blank" rel="noreferrer">
                                    {activity.form_link}
                                </a>
                            </Text>
                        )}

                        <Divider my={4} />
                        <Text fontSize="md" color="gray.400">
                            สร้างเมื่อ: {new Date(activity.created_at).toLocaleString("th-TH")}
                        </Text>
                    </Box>

                    {/* Participants */}
                    <Box mt={4}>
                        <Box mt={4}>
                            <Tabs variant="enclosed" colorScheme="blue">
                                <TabList>
                                    <Tab>รายชื่อผู้ลงทะเบียน</Tab>
                                    <Tab>E-Stamp</Tab>
                                    <Tab>ผลแบบสอบถาม</Tab>
                                </TabList>

                                <TabPanels>
                                    {/* Participants Tab */}
                                    <TabPanel>
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" fontWeight="bold">
                                                รายชื่อนักเรียนที่ลงทะเบียน
                                            </Text>
                                            <Button size="sm" colorScheme="green" onClick={exportExcel}>
                                                Export Excel
                                            </Button>
                                        </HStack>

                                        {activity.registrations?.length === 0 ? (
                                            <Text fontSize="sm" color="gray.500">
                                                ยังไม่มีผู้ลงทะเบียน
                                            </Text>
                                        ) : (
                                            <TableContainer>
                                                <Table variant="striped" size="sm">
                                                    <Thead>
                                                        <Tr>
                                                            <Th>ชื่อ-สกุล</Th>
                                                            <Th>Email</Th>
                                                            <Th>เบอร์โทร</Th>
                                                            <Th>เวลาลงทะเบียน</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {activity.registrations?.map((reg) => (
                                                            <Tr key={reg.id}>
                                                                <Td>
                                                                    {reg.student.first_name} {reg.student.last_name}
                                                                </Td>
                                                                <Td>{reg.student.email}</Td>
                                                                <Td>{reg.student.phone}</Td>
                                                                <Td>{new Date(reg.registered_at).toLocaleString("th-TH")}</Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </TabPanel>

                                    {/* E-Stamp Tab */}
                                    <TabPanel>
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" fontWeight="bold">
                                                E-Stamp (บันทึกการประทับ)
                                            </Text>
                                            <Button size="sm" onClick={fetchEstamps}>
                                                Refresh
                                            </Button>
                                        </HStack>

                                        {loadingEstamps ? (
                                            <Spinner />
                                        ) : estamps.length === 0 ? (
                                            <Text fontSize="sm" color="gray.500">
                                                ยังไม่มีข้อมูล E-Stamp
                                            </Text>
                                        ) : (
                                            <TableContainer>
                                                <Table variant="striped" size="sm">
                                                    <Thead>
                                                        <Tr>
                                                            <Th>ชื่อ-สกุล</Th>
                                                            <Th>Email</Th>
                                                            <Th>เบอร์โทร</Th>
                                                            <Th>stampBy</Th>
                                                            <Th>เวลา</Th>
                                                            <Th>Rating</Th>
                                                            {/* <Th>Feedback</Th> */}
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {estamps.map((e) => (
                                                            <Tr key={e.id}>
                                                                <Td>{e.studentName}</Td>
                                                                <Td>{e.email}</Td>
                                                                <Td>{e.phone}</Td>
                                                                <Td>{e.stampedByName || e.stampBy}</Td>
                                                                <Td>{new Date(e.issued_at).toLocaleString("th-TH")}</Td>
                                                                <Td>{e.rating ?? "—"}</Td>
                                                                {/* <Td>{e.feedback ?? "—"}</Td> */}
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </TabPanel>

                                    {/* Survey Result Tab */}
                                    <TabPanel>
                                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                                            สรุปผลแบบสอบถาม
                                        </Text>

                                        {loadingEstamps ? (
                                            <Spinner />
                                        ) : !surveySummary ? (
                                            <Text fontSize="sm" color="gray.500">
                                                ยังไม่มีข้อมูลแบบสอบถาม
                                            </Text>
                                        ) : (
                                            <>
                                                <Box width="100%" height={240}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={[
                                                                { name: "1", count: surveySummary.ratingCounts["1"] || 0 },
                                                                { name: "2", count: surveySummary.ratingCounts["2"] || 0 },
                                                                { name: "3", count: surveySummary.ratingCounts["3"] || 0 },
                                                                { name: "4", count: surveySummary.ratingCounts["4"] || 0 },
                                                                { name: "5", count: surveySummary.ratingCounts["5"] || 0 },
                                                            ]}
                                                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis allowDecimals={false} />
                                                            <Tooltip />
                                                            <Bar dataKey="count" >
                                                                <LabelList dataKey="count" position="top" />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Box>

                                                <HStack mt={3}>
                                                    <Text>เฉลี่ย (ไม่รวมค่าว่าง): </Text>
                                                    <Text fontWeight="bold" fontSize="xl">
                                                        {surveySummary.averageRating ? Number(surveySummary.averageRating).toFixed(2) : "—"}
                                                    </Text>
                                                    <Text color="gray.500"> (นับ {surveySummary.ratingCounted || 0} รายการ)</Text>
                                                </HStack>

                                                <Divider my={3} />
                                                <Text fontSize="sm" fontWeight="bold" mb={2}>
                                                    ข้อความ feedback (เรียงล่าสุด)
                                                </Text>
                                                {surveySummary.feedbacks?.length === 0 ? (
                                                    <Text color="gray.500">ยังไม่มี feedback</Text>
                                                ) : (
                                                    <VStack align="stretch" spacing={3}>
                                                        {surveySummary.feedbacks.map((f) => (
                                                            <Box
                                                                key={f.id}
                                                                p={3}
                                                                bg="white"
                                                                _dark={{ bg: "gray.700" }}
                                                                rounded="md"
                                                                shadow="sm"
                                                            >
                                                                <Text fontSize="sm" fontWeight="bold">
                                                                    {f.studentName}
                                                                    {f.rating ? ` — (${f.rating})` : ""}
                                                                </Text>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    {f.feedback}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.400" mt={1}>
                                                                    {new Date(f.issued_at).toLocaleString("th-TH")}
                                                                </Text>
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                )}
                                            </>
                                        )}
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    </Box>

                    {/* Modal แก้ไข */}
                    <Modal isOpen={isOpen} onClose={onClose} size="lg">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>แก้ไขกิจกรรม</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {isSuperAdmin && (
                                    <FormControl mb={3} p={3} bg="orange.50" rounded="md" borderWidth="1px" borderColor="orange.200">
                                        <FormLabel fontWeight="bold" color="orange.800" fontSize="sm">
                                            👑 เจ้าของกิจกรรม (Activity Owner)
                                        </FormLabel>
                                        <select
                                            value={form.ownerId || ""}
                                            onChange={(e) => setForm({ ...form, ownerId: e.target.value ? Number(e.target.value) : undefined })}
                                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #CBD5E0", background: "white", fontSize: "14px" }}
                                        >
                                            <option value="">-- ไม่ระบุ / คงเดิม --</option>
                                            {adminOwners.map((admin) => (
                                                <option key={admin.id} value={admin.id}>
                                                    {admin.name} ({admin.username})
                                                </option>
                                            ))}
                                        </select>
                                        <Text fontSize="xs" color="gray.600" mt={1}>
                                            * การเปลี่ยนเจ้าของกิจกรรมจะ Re-sync การมอบหมาย Staff ไปยังคณะใหม่โดยอัตโนมัติ
                                        </Text>
                                    </FormControl>
                                )}

                                <FormControl mb={3} display="flex" alignItems="center">
                                    <FormLabel htmlFor="display" mb="0">
                                        แสดงกิจกรรม
                                    </FormLabel>
                                    <select
                                        id="display"
                                        value={form.display ? "true" : "false"}
                                        onChange={(e) => setForm({ ...form, display: e.target.value === "true" })}
                                        style={{ width: "100px", border: "1px solid gray", fontSize: "20px", marginLeft: "10px", padding: "5px", borderRadius: "5px" }}
                                    >
                                        <option value="true">แสดง</option>
                                        <option value="false">ซ่อน</option>
                                    </select>
                                </FormControl>

                                <FormControl mb={3}>
                                    <FormLabel>ชื่อกิจกรรม</FormLabel>
                                    <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>รายละเอียด</FormLabel>
                                    <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>สถานที่</FormLabel>
                                    <Input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>วันที่</FormLabel>
                                    <Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>เวลาเริ่ม</FormLabel>
                                    <Input type="time" value={form.start_time || ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>เวลาสิ้นสุด</FormLabel>
                                    <Input type="time" value={form.end_time || ""} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>คะแนน</FormLabel>
                                    <NumberInput value={form.point || 0} min={0}>
                                        <NumberInputField onChange={(e) => setForm({ ...form, point: parseInt(e.target.value) || 0 })} />
                                    </NumberInput>
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>จำนวนผู้เข้าร่วมสูงสุด</FormLabel>
                                    <NumberInput value={form.max_participants || 0} min={1}>
                                        <NumberInputField onChange={(e) => setForm({ ...form, max_participants: parseInt(e.target.value) || 0 })} />
                                    </NumberInput>
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>ลิงก์ฟอร์ม</FormLabel>
                                    <Input value={form.form_link || ""} onChange={(e) => setForm({ ...form, form_link: e.target.value })} />
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme="blue" mr={3} onClick={handleSave}>บันทึก</Button>
                                <Button onClick={onClose}>ยกเลิก</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </>
            )}
        </KMAppLayout>
    );
};

export default ViewActivityPage;
