"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    IconButton,
    HStack,
    VStack,
    Badge,
    Switch,
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
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    useDisclosure,
    useToast,
    useColorModeValue,
    Divider,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Tabs,
    TabList,
    Tab,
} from "@chakra-ui/react";
import {
    AddIcon,
    EditIcon,
    DeleteIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExternalLinkIcon,
} from "@chakra-ui/icons";
import KMAppLayout from "@/views/layouts/KMAppLayout";
import { LandingScheduleItem } from "@/interfaces/LandingContent";
import Link from "next/link";

import { PRIMARY } from "@/constants/colors";

const categoryColorOptions = [
    { label: "ส้ม (Orange)", value: "orange" },
    { label: "ม่วง (Purple)", value: "purple" },
    { label: "น้ำเงิน (Blue)", value: "blue" },
    { label: "เขียว (Green)", value: "green" },
    { label: "เขียวอมฟ้า (Teal)", value: "teal" },
    { label: "เหลือง (Yellow)", value: "yellow" },
    { label: "แดง (Red)", value: "red" },
    { label: "เทา (Gray)", value: "gray" },
];

export default function LandingScheduleManager() {
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const headBg = useColorModeValue("orange.50", "whiteAlpha.100");
    const rowHoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
    const subSectionBg = useColorModeValue("orange.50", "whiteAlpha.50");
    const subSectionBorderColor = useColorModeValue("orange.200", "orange.700");
    const subSectionContainerBg = useColorModeValue("gray.50", "gray.800");

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();

    const [items, setItems] = useState<LandingScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSession, setFilterSession] = useState<string>("all");

    // Form state
    const [editingItem, setEditingItem] = useState<LandingScheduleItem | null>(null);
    const [time, setTime] = useState("");
    const [session, setSession] = useState("all");
    const [category, setCategory] = useState("");
    const [categoryColor, setCategoryColor] = useState("orange");
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState<string[]>([""]);
    const [hasSubSection, setHasSubSection] = useState(false);
    const [subSectionTitle, setSubSectionTitle] = useState("");
    const [subSectionItems, setSubSectionItems] = useState<string[]>([""]);
    const [isBreak, setIsBreak] = useState(false);
    const [display, setDisplay] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Delete state
    const [itemToDelete, setItemToDelete] = useState<LandingScheduleItem | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/km/landing/schedule");
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setEditingItem(null);
        setTime("");
        setSession("all");
        setCategory("");
        setCategoryColor("orange");
        setTitle("");
        setDetails([""]);
        setHasSubSection(false);
        setSubSectionTitle("");
        setSubSectionItems([""]);
        setIsBreak(false);
        setDisplay(true);
    };

    const handleOpenAdd = () => {
        resetForm();
        onOpen();
    };

    const handleOpenEdit = (item: LandingScheduleItem) => {
        setEditingItem(item);
        setTime(item.time);
        setSession(item.session);
        setCategory(item.category);
        setCategoryColor(item.categoryColor || "orange");
        setTitle(item.title);
        setDetails(item.details && item.details.length > 0 ? [...item.details] : [""]);
        setHasSubSection(Boolean(item.subSectionTitle || (item.subSectionItems && item.subSectionItems.length > 0)));
        setSubSectionTitle(item.subSectionTitle || "");
        setSubSectionItems(item.subSectionItems && item.subSectionItems.length > 0 ? [...item.subSectionItems] : [""]);
        setIsBreak(Boolean(item.isBreak));
        setDisplay(Boolean(item.display));
        onOpen();
    };

    const handleSave = async () => {
        if (!time.trim() || !title.trim() || !category.trim()) {
            toast({
                title: "กรุณากรอกข้อมูลให้ครบถ้วน",
                description: "ต้องมีเวลา หมวดหมู่ และชื่อกิจกรรม",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSubmitting(true);
        try {
            const cleanDetails = details.filter((d) => d.trim());
            const cleanSubSectionItems = subSectionItems.filter((i) => i.trim());

            const payload = {
                id: editingItem ? editingItem.id : undefined,
                time: time.trim(),
                session,
                category: category.trim(),
                categoryColor,
                title: title.trim(),
                details: cleanDetails.length > 0 ? cleanDetails : null,
                subSectionTitle: hasSubSection ? subSectionTitle.trim() : null,
                subSectionItems: hasSubSection && cleanSubSectionItems.length > 0 ? cleanSubSectionItems : null,
                isBreak,
                display,
            };

            const method = editingItem ? "PUT" : "POST";
            const res = await fetch("/api/km/landing/schedule", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to save");
            }

            toast({
                title: editingItem ? "บันทึกการแก้ไขสำเร็จ" : "เพิ่มกำหนดการใหม่สำเร็จ",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
            fetchItems();
        } catch (error: any) {
            toast({
                title: "เกิดข้อผิดพลาดในการบันทึก",
                description: error.message || "โปรดลองใหม่อีกครั้ง",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleDisplay = async (item: LandingScheduleItem) => {
        try {
            const nextDisplay = !item.display;
            const res = await fetch("/api/km/landing/schedule", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id, display: nextDisplay }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, display: nextDisplay } : i))
            );

            toast({
                title: nextDisplay ? "เปิดการแสดงผลบนหน้าแรกแล้ว" : "ซ่อนกิจกรรมจากหน้าแรกแล้ว",
                status: "info",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "ไม่สามารถเปลี่ยนสถานะได้",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const res = await fetch(`/api/km/landing/schedule?id=${itemToDelete.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");

            toast({
                title: "ลบกำหนดการสำเร็จ",
                status: "success",
                duration: 2000,
                isClosable: true,
            });

            onDeleteClose();
            fetchItems();
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาดในการลบ",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleMove = async (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const updated = [...items];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        // Reassign orderIndex
        const reorderPayload = updated.map((item, idx) => ({
            id: item.id,
            orderIndex: idx + 1,
        }));

        setItems(updated);

        try {
            await fetch("/api/km/landing/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "schedule", items: reorderPayload }),
            });
        } catch (err) {
            console.error("Reorder failed:", err);
            fetchItems();
        }
    };

    const filteredItems = items.filter((item) => {
        if (filterSession === "morning") return item.session === "morning";
        if (filterSession === "afternoon") return item.session === "afternoon";
        if (filterSession === "break") return item.session === "break" || item.isBreak;
        return true;
    });

    return (
        <KMAppLayout navigation="จัดการกำหนดการหน้าแรก">
            <Box>
                {/* Header Section */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={4}
                    mb={6}
                >
                    <Box>
                        <Heading size="md" color={PRIMARY} mb={1}>
                            จัดการกำหนดการหน้าแรก (Schedule Manager)
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            เพิ่ม แก้ไข ลบ และจัดลำดับเวลากิจกรรมที่จะแสดงผลในตารางกำหนดการบนหน้าแรก
                        </Text>
                    </Box>

                    <HStack spacing={3}>
                        <Button
                            as={Link}
                            href="/#schedule"
                            target="_blank"
                            size="sm"
                            variant="outline"
                            borderColor={PRIMARY}
                            color={PRIMARY}
                            leftIcon={<ExternalLinkIcon />}
                        >
                            ดูหน้าเว็บจริง
                        </Button>
                        <Button
                            size="sm"
                            bg={PRIMARY}
                            _hover={{ bg: "#E0380B" }}
                            color="white"
                            leftIcon={<AddIcon />}
                            onClick={handleOpenAdd}
                        >
                            เพิ่มกำหนดการ
                        </Button>
                    </HStack>
                </Flex>

                {/* Filter Tabs */}
                <Tabs
                    variant="soft-rounded"
                    colorScheme="orange"
                    size="sm"
                    mb={4}
                    onChange={(idx) => {
                        const sessions = ["all", "morning", "afternoon", "break"];
                        setFilterSession(sessions[idx]);
                    }}
                >
                    <TabList>
                        <Tab>ทั้งหมด ({items.length})</Tab>
                        <Tab>รอบเช้า ({items.filter((i) => i.session === "morning").length})</Tab>
                        <Tab>รอบบ่าย ({items.filter((i) => i.session === "afternoon").length})</Tab>
                        <Tab>ช่วงพัก ({items.filter((i) => i.session === "break" || i.isBreak).length})</Tab>
                    </TabList>
                </Tabs>

                {/* Table Container */}
                <Box
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    rounded="xl"
                    shadow="sm"
                    overflow="hidden"
                >
                    <TableContainer overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead bg={headBg}>
                                <Tr>
                                    <Th width="70px" textAlign="center">ลำดับ</Th>
                                    <Th width="160px">เวลา</Th>
                                    <Th width="130px">หมวดหมู่</Th>
                                    <Th>ชื่อกิจกรรมและรายละเอียด</Th>
                                    <Th width="100px" textAlign="center">รอบ</Th>
                                    <Th width="90px" textAlign="center">แสดงผล</Th>
                                    <Th width="140px" textAlign="center">จัดการ</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                                            กำลังโหลดข้อมูลกำหนดการ...
                                        </Td>
                                    </Tr>
                                ) : filteredItems.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                                            ไม่พบรายการในหมวดนี้ คลิกปุ่ม &quot;+ เพิ่มกำหนดการ&quot; เพื่อสร้างรายการใหม่
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredItems.map((item, idx) => (
                                        <Tr
                                            key={item.id}
                                            _hover={{ bg: rowHoverBg }}
                                            opacity={item.display ? 1 : 0.6}
                                        >
                                            {/* Reorder Buttons */}
                                            <Td textAlign="center">
                                                <HStack spacing={1} justify="center">
                                                    <IconButton
                                                        aria-label="Move Up"
                                                        icon={<ArrowUpIcon />}
                                                        size="xs"
                                                        variant="ghost"
                                                        isDisabled={idx === 0}
                                                        onClick={() => handleMove(idx, "up")}
                                                    />
                                                    <IconButton
                                                        aria-label="Move Down"
                                                        icon={<ArrowDownIcon />}
                                                        size="xs"
                                                        variant="ghost"
                                                        isDisabled={idx === filteredItems.length - 1}
                                                        onClick={() => handleMove(idx, "down")}
                                                    />
                                                </HStack>
                                            </Td>

                                            {/* Time */}
                                            <Td fontWeight="bold" color={PRIMARY} whiteSpace="nowrap">
                                                {item.time}
                                            </Td>

                                            {/* Category */}
                                            <Td>
                                                <Badge
                                                    colorScheme={item.categoryColor || "orange"}
                                                    rounded="md"
                                                    px={2}
                                                    py={0.5}
                                                >
                                                    {item.category}
                                                </Badge>
                                            </Td>

                                            {/* Activity Details */}
                                            <Td>
                                                <VStack align="flex-start" spacing={1}>
                                                    <Text fontWeight="semibold" color={textColor}>
                                                        {item.title}
                                                    </Text>

                                                    {item.details && item.details.length > 0 && (
                                                        <VStack align="flex-start" spacing={0.5} pl={2}>
                                                            {item.details.map((d, dIdx) => (
                                                                <Text key={dIdx} fontSize="xs" color="gray.500">
                                                                    • {d}
                                                                </Text>
                                                            ))}
                                                        </VStack>
                                                    )}

                                                    {item.subSectionTitle && (
                                                        <Box
                                                            mt={1}
                                                            p={2}
                                                            bg={subSectionBg}
                                                            rounded="md"
                                                            border="1px dashed"
                                                            borderColor={subSectionBorderColor}
                                                            w="full"
                                                        >
                                                            <Text fontSize="xs" fontWeight="bold" color={PRIMARY}>
                                                                {item.subSectionTitle}
                                                            </Text>
                                                            {item.subSectionItems?.map((zone, zIdx) => (
                                                                <Text key={zIdx} fontSize="xs" color="gray.600" pl={2}>
                                                                    - {zone}
                                                                </Text>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </VStack>
                                            </Td>

                                            {/* Session */}
                                            <Td textAlign="center">
                                                <Badge
                                                    variant="outline"
                                                    colorScheme={
                                                        item.session === "morning"
                                                            ? "blue"
                                                            : item.session === "afternoon"
                                                            ? "orange"
                                                            : "gray"
                                                    }
                                                >
                                                    {item.session === "morning"
                                                        ? "เช้า"
                                                        : item.session === "afternoon"
                                                        ? "บ่าย"
                                                        : item.session === "break"
                                                        ? "เบรก"
                                                        : "ตลอดวัน"}
                                                </Badge>
                                            </Td>

                                            {/* Display Switch */}
                                            <Td textAlign="center">
                                                <Switch
                                                    colorScheme="orange"
                                                    isChecked={item.display}
                                                    onChange={() => handleToggleDisplay(item)}
                                                />
                                            </Td>

                                            {/* Action Buttons */}
                                            <Td textAlign="center">
                                                <HStack spacing={2} justify="center">
                                                    <IconButton
                                                        aria-label="Edit"
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="orange"
                                                        variant="ghost"
                                                        onClick={() => handleOpenEdit(item)}
                                                    />
                                                    <IconButton
                                                        aria-label="Delete"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setItemToDelete(item);
                                                            onDeleteOpen();
                                                        }}
                                                    />
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Add / Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader color={PRIMARY}>
                            {editingItem ? "แก้ไขกำหนดการ" : "เพิ่มกำหนดการใหม่"}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <HStack w="full" spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">เวลา (เช่น 15.00 – 17.00 น.)</FormLabel>
                                        <Input
                                            placeholder="เช่น 15.00 – 17.00 น."
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">ช่วงเวลารอบ</FormLabel>
                                        <Select value={session} onChange={(e) => setSession(e.target.value)}>
                                            <option value="all">ตลอดวัน (all)</option>
                                            <option value="morning">รอบเช้า (morning)</option>
                                            <option value="afternoon">รอบบ่าย (afternoon)</option>
                                            <option value="break">พัก / เบรก (break)</option>
                                        </Select>
                                    </FormControl>
                                </HStack>

                                <HStack w="full" spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">หมวดหมู่</FormLabel>
                                        <Input
                                            placeholder="เช่น ถาม - ตอบ & กิจกรรม, เวทีหลัก, โซน 3"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm">สีหมวดหมู่</FormLabel>
                                        <Select
                                            value={categoryColor}
                                            onChange={(e) => setCategoryColor(e.target.value)}
                                        >
                                            {categoryColorOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </HStack>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">ชื่อกิจกรรมหลัก</FormLabel>
                                    <Input
                                        placeholder="เช่น KMUTT Industry Consultation Clinic"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </FormControl>

                                {/* Details / Bullet points */}
                                <FormControl>
                                    <Flex justify="space-between" align="center" mb={1}>
                                        <FormLabel fontSize="sm" mb={0}>
                                            หัวข้อย่อย / รายละเอียดกิจกรรม (Bullet Points)
                                        </FormLabel>
                                        <Button
                                            size="xs"
                                            colorScheme="orange"
                                            variant="outline"
                                            onClick={() => setDetails([...details, ""])}
                                        >
                                            + เพิ่มหัวข้อ
                                        </Button>
                                    </Flex>
                                    <VStack spacing={2} align="stretch" mt={2}>
                                        {details.map((d, idx) => (
                                            <HStack key={idx} spacing={2}>
                                                <Input
                                                    size="sm"
                                                    placeholder={`รายละเอียดข้อที่ ${idx + 1}`}
                                                    value={d}
                                                    onChange={(e) => {
                                                        const copy = [...details];
                                                        copy[idx] = e.target.value;
                                                        setDetails(copy);
                                                    }}
                                                />
                                                {details.length > 1 && (
                                                    <IconButton
                                                        aria-label="Remove"
                                                        icon={<DeleteIcon />}
                                                        size="xs"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setDetails(details.filter((_, i) => i !== idx));
                                                        }}
                                                    />
                                                )}
                                            </HStack>
                                        ))}
                                    </VStack>
                                </FormControl>

                                <Divider />

                                {/* SubSection (e.g. Zones in the event) */}
                                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                    <FormLabel fontSize="sm" mb="0">
                                        มีกล่องแสดงโซนย่อยในกิจกรรมนี้ (SubSection)
                                    </FormLabel>
                                    <Switch
                                        colorScheme="orange"
                                        isChecked={hasSubSection}
                                        onChange={(e) => setHasSubSection(e.target.checked)}
                                    />
                                </FormControl>

                                {hasSubSection && (
                                    <Box
                                        w="full"
                                        p={4}
                                        bg={subSectionContainerBg}
                                        rounded="lg"
                                        border="1px solid"
                                        borderColor={borderColor}
                                    >
                                        <FormControl mb={3}>
                                            <FormLabel fontSize="xs">หัวข้อกล่องโซนย่อย</FormLabel>
                                            <Input
                                                size="sm"
                                                placeholder="เช่น กิจกรรมภายในงาน มีทั้งหมด 3 โซน"
                                                value={subSectionTitle}
                                                onChange={(e) => setSubSectionTitle(e.target.value)}
                                            />
                                        </FormControl>

                                        <Flex justify="space-between" align="center" mb={1}>
                                            <FormLabel fontSize="xs" mb={0}>
                                                รายการโซน
                                            </FormLabel>
                                            <Button
                                                size="xs"
                                                colorScheme="orange"
                                                variant="ghost"
                                                onClick={() => setSubSectionItems([...subSectionItems, ""])}
                                            >
                                                + เพิ่มโซน
                                            </Button>
                                        </Flex>
                                        <VStack spacing={2} align="stretch">
                                            {subSectionItems.map((zone, zIdx) => (
                                                <HStack key={zIdx} spacing={2}>
                                                    <Input
                                                        size="sm"
                                                        placeholder={`โซนที่ ${zIdx + 1}`}
                                                        value={zone}
                                                        onChange={(e) => {
                                                            const copy = [...subSectionItems];
                                                            copy[zIdx] = e.target.value;
                                                            setSubSectionItems(copy);
                                                        }}
                                                    />
                                                    {subSectionItems.length > 1 && (
                                                        <IconButton
                                                            aria-label="Remove zone"
                                                            icon={<DeleteIcon />}
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSubSectionItems(
                                                                    subSectionItems.filter((_, i) => i !== zIdx)
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                </HStack>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}

                                <Divider />

                                <HStack w="full" justify="space-between">
                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel fontSize="sm" mb="0">
                                            เป็นช่วงพักเบรก (Break)
                                        </FormLabel>
                                        <Switch
                                            colorScheme="orange"
                                            isChecked={isBreak}
                                            onChange={(e) => setIsBreak(e.target.checked)}
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center" justifyContent="flex-end">
                                        <FormLabel fontSize="sm" mb="0">
                                            แสดงบนหน้าแรก
                                        </FormLabel>
                                        <Switch
                                            colorScheme="orange"
                                            isChecked={display}
                                            onChange={(e) => setDisplay(e.target.checked)}
                                        />
                                    </FormControl>
                                </HStack>

                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={onClose}>
                                ยกเลิก
                            </Button>
                            <Button
                                bg={PRIMARY}
                                _hover={{ bg: "#E0380B" }}
                                color="white"
                                isLoading={submitting}
                                onClick={handleSave}
                            >
                                บันทึกข้อมูล
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation Alert */}
                <AlertDialog
                    isOpen={isDeleteOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onDeleteClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                ยืนยันการลบกำหนดการ
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                คุณแน่ใจหรือไม่ว่าต้องการลบกำหนดการ:{" "}
                                <Text as="span" fontWeight="bold" color="red.500">
                                    {itemToDelete?.title} ({itemToDelete?.time})
                                </Text>{" "}
                                ? การลบนี้จะไม่สามารถย้อนกลับได้
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>
                                    ยกเลิก
                                </Button>
                                <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                                    ลบกำหนดการ
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Box>
        </KMAppLayout>
    );
}
