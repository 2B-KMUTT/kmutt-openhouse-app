// pages/km/activities/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    Flex,
    Text,
    Spinner,
    Badge,
    HStack,
    VStack,
    Divider,
    Button,
    Input,
    Textarea,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
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
    FormHelperText,
    Switch,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardBody,
    SimpleGrid,
    useColorModeValue,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ArrowBackIcon, DownloadIcon, RepeatIcon } from "@chakra-ui/icons";

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

    const borderColor = useColorModeValue("gray.200", "gray.600");
    const cardBg = useColorModeValue("white", "gray.750");

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState<Partial<Activity>>({});
    const [adminOwners, setAdminOwners] = useState<{ id: number; name: string; username: string }[]>([]);

    // Estamp + survey states
    const [estamps, setEstamps] = useState<Estamp[]>([]);
    const [surveySummary, setSurveySummary] = useState<SurveySummary | null>(null);
    const [loadingEstamps, setLoadingEstamps] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/km/admin-owners")
                .then((res) => res.json())
                .then((data) => setAdminOwners(Array.isArray(data) ? data : []))
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
        fetchEstamps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
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
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.message || "ไม่สามารถบันทึกกิจกรรมได้");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setSaving(false);
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
        <KMAppLayout navigation={`กิจกรรม / #${id}`}>
            {loading ? (
                <HStack justify="center" py={12}>
                    <Spinner size="lg" color="orange.500" />
                </HStack>
            ) : !activity ? (
                <Box py={8} textAlign="center">
                    <Text color="red.500" fontSize="md">
                        ไม่พบข้อมูลกิจกรรม
                    </Text>
                    <Button
                        mt={4}
                        size="sm"
                        variant="outline"
                        leftIcon={<ArrowBackIcon />}
                        onClick={() => router.push("/_km/dashboard")}
                    >
                        กลับหน้า Dashboard
                    </Button>
                </Box>
            ) : (
                <VStack spacing={6} align="stretch">
                    {/* Activity Header Card */}
                    <Card variant="outline" borderColor={borderColor} bg={cardBg}>
                        <CardBody p={5}>
                            {!activity.display && (
                                <Alert status="warning" rounded="lg" mb={4} py={2}>
                                    <AlertIcon />
                                    <Text fontSize="xs">
                                        กิจกรรมนี้ถูกซ่อนอยู่ — จะไม่แสดงให้นักเรียนเห็นในหน้าลงทะเบียน
                                    </Text>
                                </Alert>
                            )}

                            {/* Title & Actions */}
                            <Flex
                                direction={{ base: "column", md: "row" }}
                                justify="space-between"
                                align={{ base: "flex-start", md: "center" }}
                                gap={3}
                                mb={4}
                            >
                                <VStack align="flex-start" spacing={1}>
                                    <HStack spacing={2} wrap="wrap">
                                        <Text fontSize="md" fontWeight="bold">
                                            #{activity.id} {activity.title}
                                        </Text>
                                        <Badge
                                            variant="subtle"
                                            colorScheme={
                                                activity.activity_type === "workshop"
                                                    ? "blue"
                                                    : activity.activity_type === "regis_activity"
                                                    ? "green"
                                                    : "orange"
                                            }
                                            fontSize="xs"
                                        >
                                            {activity.activity_type.replace("_", " ")}
                                        </Badge>
                                        {activity.owner && isSuperAdmin && (
                                            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                                สังกัด: {activity.owner.name} ({activity.owner.username})
                                            </Badge>
                                        )}
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">
                                        สร้างเมื่อ: {new Date(activity.created_at).toLocaleString("th-TH")}
                                    </Text>
                                </VStack>

                                <HStack spacing={2}>
                                    <Button
                                        size="sm"
                                        colorScheme="orange"
                                        leftIcon={<EditIcon />}
                                        onClick={onOpen}
                                    >
                                        แก้ไข
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        leftIcon={<DeleteIcon />}
                                        onClick={handleDelete}
                                    >
                                        ลบ
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        leftIcon={<ArrowBackIcon />}
                                        onClick={() => router.push("/_km/dashboard")}
                                    >
                                        กลับ
                                    </Button>
                                </HStack>
                            </Flex>

                            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} mb={4}>
                                {activity.description}
                            </Text>

                            {/* Meta Grid */}
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
                                <Box>
                                    <Text fontSize="xs" color="gray.500">สถานที่จัดงาน</Text>
                                    <Text fontSize="xs" fontWeight="semibold">📍 {activity.location}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500">คณะ / ภาควิชา</Text>
                                    <Text fontSize="xs" fontWeight="semibold">
                                        🏫 {activity.faculty?.name_th} - {activity.department?.name_th}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500">วันและเวลา</Text>
                                    <Text fontSize="xs" fontWeight="semibold">
                                        📅 {activity.date} ({activity.start_time} - {activity.end_time})
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="gray.500">ผู้ลงทะเบียน / คะแนน</Text>
                                    <Text fontSize="xs" fontWeight="semibold" color="orange.600">
                                        👥 {activity.current_register_participants} / {activity.max_participants} คน • ⭐ {activity.point} แต้ม
                                    </Text>
                                </Box>
                            </SimpleGrid>

                            {activity.form_link && (
                                <Box mt={3} pt={3} borderTop="1px solid" borderColor={borderColor}>
                                    <Text fontSize="xs" color="gray.500">
                                        ลิงก์แบบประเมิน:{" "}
                                        <Text
                                            as="a"
                                            href={activity.form_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            color="orange.500"
                                            fontWeight="medium"
                                            _hover={{ textDecoration: "underline" }}
                                        >
                                            {activity.form_link}
                                        </Text>
                                    </Text>
                                </Box>
                            )}
                        </CardBody>
                    </Card>

                    {/* Tabs Section: Participants, E-Stamp, Feedback */}
                    <Tabs variant="enclosed" colorScheme="orange">
                        <TabList>
                            <Tab fontWeight="semibold" fontSize="xs">
                                รายชื่อผู้ลงทะเบียน ({activity.registrations?.length || 0})
                            </Tab>
                            <Tab fontWeight="semibold" fontSize="xs">
                                บันทึก E-Stamp ({estamps.length})
                            </Tab>
                            <Tab fontWeight="semibold" fontSize="xs">
                                ผลแบบประเมิน
                            </Tab>
                        </TabList>

                        <TabPanels>
                            {/* Participants Tab */}
                            <TabPanel px={0} pt={4}>
                                <Card variant="outline" borderColor={borderColor}>
                                    <CardBody p={4}>
                                        <HStack justify="space-between" mb={4}>
                                            <Text fontSize="sm" fontWeight="bold">
                                                รายชื่อนักเรียนที่ลงทะเบียน ({activity.registrations?.length || 0} คน)
                                            </Text>
                                            <Button
                                                size="sm"
                                                colorScheme="green"
                                                variant="outline"
                                                leftIcon={<DownloadIcon />}
                                                onClick={exportExcel}
                                                isDisabled={!activity.registrations?.length}
                                            >
                                                Export Excel
                                            </Button>
                                        </HStack>

                                        {!activity.registrations?.length ? (
                                            <Box py={8} textAlign="center" color="gray.500">
                                                <Text fontSize="xs">ยังไม่มีผู้ลงทะเบียนในกิจกรรมนี้</Text>
                                            </Box>
                                        ) : (
                                            <TableContainer>
                                                <Table variant="simple" size="sm">
                                                    <Thead bg={useColorModeValue("gray.50", "gray.800")}>
                                                        <Tr>
                                                            <Th>ชื่อ-สกุล</Th>
                                                            <Th>อีเมล</Th>
                                                            <Th>เบอร์โทร</Th>
                                                            <Th>เวลาลงทะเบียน</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {activity.registrations.map((reg) => (
                                                            <Tr key={reg.id}>
                                                                <Td fontWeight="medium">
                                                                    {reg.student.first_name} {reg.student.last_name}
                                                                </Td>
                                                                <Td>{reg.student.email}</Td>
                                                                <Td>{reg.student.phone}</Td>
                                                                <Td color="gray.500">
                                                                    {new Date(reg.registered_at).toLocaleString("th-TH")}
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </CardBody>
                                </Card>
                            </TabPanel>

                            {/* E-Stamp Tab */}
                            <TabPanel px={0} pt={4}>
                                <Card variant="outline" borderColor={borderColor}>
                                    <CardBody p={4}>
                                        <HStack justify="space-between" mb={4}>
                                            <Text fontSize="sm" fontWeight="bold">
                                                ประวัติการประทับตรา E-Stamp ({estamps.length} รายการ)
                                            </Text>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                leftIcon={<RepeatIcon />}
                                                onClick={fetchEstamps}
                                                isLoading={loadingEstamps}
                                            >
                                                รีเฟรช
                                            </Button>
                                        </HStack>

                                        {loadingEstamps ? (
                                            <HStack justify="center" py={8}>
                                                <Spinner size="md" color="orange.500" />
                                            </HStack>
                                        ) : estamps.length === 0 ? (
                                            <Box py={8} textAlign="center" color="gray.500">
                                                <Text fontSize="xs">ยังไม่มีบันทึกการประทับตรา E-Stamp</Text>
                                            </Box>
                                        ) : (
                                            <TableContainer>
                                                <Table variant="simple" size="sm">
                                                    <Thead bg={useColorModeValue("gray.50", "gray.800")}>
                                                        <Tr>
                                                            <Th>ชื่อ-สกุล</Th>
                                                            <Th>อีเมล</Th>
                                                            <Th>เบอร์โทร</Th>
                                                            <Th>ผู้ประทับตรา</Th>
                                                            <Th>เวลาที่ประทับ</Th>
                                                            <Th>คะแนนประเมิน</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {estamps.map((e) => (
                                                            <Tr key={e.id}>
                                                                <Td fontWeight="medium">{e.studentName}</Td>
                                                                <Td>{e.email}</Td>
                                                                <Td>{e.phone}</Td>
                                                                <Td>
                                                                    <Badge variant="subtle" colorScheme="gray" fontSize="xs">
                                                                        {e.stampedByName || e.stampBy}
                                                                    </Badge>
                                                                </Td>
                                                                <Td color="gray.500">
                                                                    {new Date(e.issued_at).toLocaleString("th-TH")}
                                                                </Td>
                                                                <Td>
                                                                    {e.rating ? (
                                                                        <Badge colorScheme="orange" variant="solid" fontSize="xs">
                                                                            ⭐ {e.rating}
                                                                        </Badge>
                                                                    ) : (
                                                                        "—"
                                                                    )}
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </CardBody>
                                </Card>
                            </TabPanel>

                            {/* Survey Result Tab */}
                            <TabPanel px={0} pt={4}>
                                <Card variant="outline" borderColor={borderColor}>
                                    <CardBody p={4}>
                                        <Text fontSize="sm" fontWeight="bold" mb={4}>
                                            สรุปผลคะแนนแบบประเมินกิจกรรม
                                        </Text>

                                        {loadingEstamps ? (
                                            <HStack justify="center" py={8}>
                                                <Spinner size="md" color="orange.500" />
                                            </HStack>
                                        ) : !surveySummary ? (
                                            <Box py={8} textAlign="center" color="gray.500">
                                                <Text fontSize="xs">ยังไม่มีข้อมูลการประเมินกิจกรรม</Text>
                                            </Box>
                                        ) : (
                                            <>
                                                <Box width="100%" height={240}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={[
                                                                { name: "1 ดาว", count: surveySummary.ratingCounts["1"] || 0 },
                                                                { name: "2 ดาว", count: surveySummary.ratingCounts["2"] || 0 },
                                                                { name: "3 ดาว", count: surveySummary.ratingCounts["3"] || 0 },
                                                                { name: "4 ดาว", count: surveySummary.ratingCounts["4"] || 0 },
                                                                { name: "5 ดาว", count: surveySummary.ratingCounts["5"] || 0 },
                                                            ]}
                                                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" fontSize={12} />
                                                            <YAxis allowDecimals={false} fontSize={12} />
                                                            <Tooltip />
                                                            <Bar dataKey="count" fill="#FA4616">
                                                                <LabelList dataKey="count" position="top" fontSize={12} />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Box>

                                                <HStack mt={4} p={3} bg={useColorModeValue("gray.50", "gray.800")} rounded="lg">
                                                    <Text fontSize="xs">คะแนนเฉลี่ย:</Text>
                                                    <Text fontWeight="bold" fontSize="md" color="orange.500">
                                                        {surveySummary.averageRating ? Number(surveySummary.averageRating).toFixed(2) : "—"} / 5.00
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        (จากผู้ตอบทั้งหมด {surveySummary.ratingCounted || 0} คน)
                                                    </Text>
                                                </HStack>

                                                <Divider my={4} />

                                                <Text fontSize="sm" fontWeight="bold" mb={3}>
                                                    ข้อเสนอแนะเพิ่มเติม (Feedback)
                                                </Text>

                                                {!surveySummary.feedbacks?.length ? (
                                                    <Text fontSize="xs" color="gray.500">ยังไม่มีข้อเสนอแนะ</Text>
                                                ) : (
                                                    <VStack align="stretch" spacing={2}>
                                                        {surveySummary.feedbacks.map((f) => (
                                                            <Box
                                                                key={f.id}
                                                                p={3}
                                                                border="1px solid"
                                                                borderColor={borderColor}
                                                                rounded="lg"
                                                            >
                                                                <HStack justify="space-between" mb={1}>
                                                                    <Text fontSize="xs" fontWeight="bold">
                                                                        {f.studentName}
                                                                    </Text>
                                                                    {f.rating && (
                                                                        <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                                                            ⭐ {f.rating}
                                                                        </Badge>
                                                                    )}
                                                                </HStack>
                                                                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
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
                                    </CardBody>
                                </Card>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    {/* Clean Chakra Edit Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader fontSize="md" pb={2}>
                                แก้ไขข้อมูลกิจกรรม #{activity.id}
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <VStack spacing={4} align="stretch">
                                    {/* Super Admin Ownership Control */}
                                    {isSuperAdmin && (
                                        <Card variant="outline" borderColor="orange.200" bg="orange.50" _dark={{ bg: "whiteAlpha.50", borderColor: "orange.700" }}>
                                            <CardBody p={3}>
                                                <FormControl>
                                                    <HStack justify="space-between" mb={1}>
                                                        <FormLabel mb={0} fontSize="xs" fontWeight="bold">
                                                            คณะ / ส่วนงานเจ้าของกิจกรรม
                                                        </FormLabel>
                                                        <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                                                            Super Admin Control
                                                        </Badge>
                                                    </HStack>
                                                    <Select
                                                        size="sm"
                                                        bg="white"
                                                        _dark={{ bg: "gray.800" }}
                                                        rounded="lg"
                                                        focusBorderColor="orange.500"
                                                        value={form.ownerId || ""}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                ownerId: e.target.value ? Number(e.target.value) : undefined,
                                                            })
                                                        }
                                                    >
                                                        <option value="">-- ไม่ระบุ / คงเดิม --</option>
                                                        {adminOwners.map((admin) => (
                                                            <option key={admin.id} value={admin.id}>
                                                                {admin.name} ({admin.username})
                                                            </option>
                                                        ))}
                                                    </Select>
                                                    <FormHelperText fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                                                        การเปลี่ยนเจ้าของกิจกรรมจะ Re-sync การมอบหมาย Staff ไปยังคณะใหม่โดยอัตโนมัติ
                                                    </FormHelperText>
                                                </FormControl>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* Display Switch */}
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <FormLabel htmlFor="display-toggle" mb={0} fontSize="xs" fontWeight="semibold">
                                                แสดงกิจกรรมให้นักเรียนเห็น
                                            </FormLabel>
                                            <FormHelperText fontSize="xs" mt={0}>
                                                {form.display ? "เปิดแสดงในหน้ารายการกิจกรรม" : "ซ่อนกิจกรรม ไม่แสดงในหน้ารายการ"}
                                            </FormHelperText>
                                        </Box>
                                        <Switch
                                            id="display-toggle"
                                            colorScheme="orange"
                                            isChecked={Boolean(form.display)}
                                            onChange={(e) => setForm({ ...form, display: e.target.checked })}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold">ชื่อกิจกรรม</FormLabel>
                                        <Input
                                            size="sm"
                                            rounded="lg"
                                            focusBorderColor="orange.500"
                                            value={form.title || ""}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="semibold">รายละเอียด</FormLabel>
                                        <Textarea
                                            size="sm"
                                            rounded="lg"
                                            rows={3}
                                            focusBorderColor="orange.500"
                                            value={form.description || ""}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                    </FormControl>

                                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="semibold">สถานที่จัดงาน</FormLabel>
                                            <Input
                                                size="sm"
                                                rounded="lg"
                                                focusBorderColor="orange.500"
                                                value={form.location || ""}
                                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="semibold">วันที่จัดกิจกรรม</FormLabel>
                                            <Input
                                                size="sm"
                                                rounded="lg"
                                                focusBorderColor="orange.500"
                                                value={form.date || ""}
                                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="semibold">เวลาเริ่ม</FormLabel>
                                            <Input
                                                type="time"
                                                size="sm"
                                                rounded="lg"
                                                focusBorderColor="orange.500"
                                                value={form.start_time || ""}
                                                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel fontSize="xs" fontWeight="semibold">เวลาสิ้นสุด</FormLabel>
                                            <Input
                                                type="time"
                                                size="sm"
                                                rounded="lg"
                                                focusBorderColor="orange.500"
                                                value={form.end_time || ""}
                                                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="semibold">คะแนนกิจกรรม (E-Stamp)</FormLabel>
                                            <NumberInput
                                                size="sm"
                                                min={0}
                                                max={5}
                                                value={form.point ?? 1}
                                                focusBorderColor="orange.500"
                                                onChange={(_, val) => setForm({ ...form, point: val || 0 })}
                                            >
                                                <NumberInputField rounded="lg" />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize="xs" fontWeight="semibold">จำนวนผู้เข้าร่วมสูงสุด</FormLabel>
                                            <NumberInput
                                                size="sm"
                                                min={0}
                                                value={form.max_participants ?? 0}
                                                focusBorderColor="orange.500"
                                                onChange={(_, val) => setForm({ ...form, max_participants: val || 0 })}
                                            >
                                                <NumberInputField rounded="lg" />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                    </SimpleGrid>

                                    <FormControl>
                                        <FormLabel fontSize="xs" fontWeight="semibold">ลิงก์แบบประเมิน (Form Link)</FormLabel>
                                        <Input
                                            size="sm"
                                            rounded="lg"
                                            focusBorderColor="orange.500"
                                            value={form.form_link || ""}
                                            onChange={(e) => setForm({ ...form, form_link: e.target.value })}
                                        />
                                    </FormControl>
                                </VStack>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="outline" size="sm" mr={3} onClick={onClose}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    colorScheme="orange"
                                    size="sm"
                                    onClick={handleSave}
                                    isLoading={saving}
                                    loadingText="กำลังบันทึก..."
                                >
                                    บันทึกการเปลี่ยนแปลง
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </VStack>
            )}
        </KMAppLayout>
    );
};

export default ViewActivityPage;