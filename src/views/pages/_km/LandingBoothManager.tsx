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
    Switch,
    SimpleGrid,
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
    Badge,
    Stack,
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
import { LandingBoothItem } from "@/interfaces/LandingContent";
import Link from "next/link";

const PRIMARY = "#FA4616";

export default function LandingBoothManager() {
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textColor = useColorModeValue("gray.800", "gray.100");

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();

    const [booths, setBooths] = useState<LandingBoothItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [editingBooth, setEditingBooth] = useState<LandingBoothItem | null>(null);
    const [location, setLocation] = useState("");
    const [units, setUnits] = useState<string[]>([""]);
    const [display, setDisplay] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Delete state
    const [boothToDelete, setBoothToDelete] = useState<LandingBoothItem | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const fetchBooths = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/km/landing/booth");
            if (!res.ok) throw new Error("Failed to load");
            const data = await res.json();
            setBooths(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "เกิดข้อผิดพลาดในการโหลดข้อมูลบูท",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooths();
    }, []);

    const resetForm = () => {
        setEditingBooth(null);
        setLocation("");
        setUnits([""]);
        setDisplay(true);
    };

    const handleOpenAdd = () => {
        resetForm();
        onOpen();
    };

    const handleOpenEdit = (b: LandingBoothItem) => {
        setEditingBooth(b);
        setLocation(b.location);
        setUnits(b.units && b.units.length > 0 ? [...b.units] : [""]);
        setDisplay(b.display);
        onOpen();
    };

    const handleSave = async () => {
        if (!location.trim()) {
            toast({
                title: "กรุณาระบุชื่อโซนหรือสถานที่บูท",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const cleanUnits = units.map((u) => u.trim()).filter(Boolean);
        if (cleanUnits.length === 0) {
            toast({
                title: "กรุณาระบุอย่างน้อย 1 รายการหน่วยงานหรือกิจกรรม",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                id: editingBooth ? editingBooth.id : undefined,
                location: location.trim(),
                units: cleanUnits,
                display,
            };

            const method = editingBooth ? "PUT" : "POST";
            const res = await fetch("/api/km/landing/booth", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to save");
            }

            toast({
                title: editingBooth ? "บันทึกการแก้ไขโซนบูทสำเร็จ" : "เพิ่มโซนบูทใหม่สำเร็จ",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
            fetchBooths();
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

    const handleToggleDisplay = async (b: LandingBoothItem) => {
        try {
            const nextDisplay = !b.display;
            const res = await fetch("/api/km/landing/booth", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: b.id, display: nextDisplay }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            setBooths((prev) =>
                prev.map((item) => (item.id === b.id ? { ...item, display: nextDisplay } : item))
            );

            toast({
                title: nextDisplay ? "เปิดการแสดงผลโซนนี้บนหน้าแรกแล้ว" : "ซ่อนโซนนี้จากหน้าแรกแล้ว",
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
        if (!boothToDelete) return;
        try {
            const res = await fetch(`/api/km/landing/booth?id=${boothToDelete.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");

            toast({
                title: "ลบโซนบูทสำเร็จ",
                status: "success",
                duration: 2000,
                isClosable: true,
            });

            onDeleteClose();
            fetchBooths();
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
        if (targetIndex < 0 || targetIndex >= booths.length) return;

        const updated = [...booths];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        const reorderPayload = updated.map((item, idx) => ({
            id: item.id,
            orderIndex: idx + 1,
        }));

        setBooths(updated);

        try {
            await fetch("/api/km/landing/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "booth", items: reorderPayload }),
            });
        } catch (err) {
            console.error("Reorder failed:", err);
            fetchBooths();
        }
    };

    return (
        <KMAppLayout navigation="จัดการบูทและโซนหน้าแรก">
            <Box>
                {/* Header */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={4}
                    mb={6}
                >
                    <Box>
                        <Heading size="md" color={PRIMARY} mb={1}>
                            จัดการบูทแนะนำหลักสูตร & โซนกิจกรรม (Booth Manager)
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            เพิ่ม แก้ไข ลบ และจัดลำดับบูทและโซนแนะนำหลักสูตรที่จะแสดงผลบนหน้าแรก (เช่น โซน 1, โซน 2, โซน 3)
                        </Text>
                    </Box>

                    <HStack spacing={3}>
                        <Button
                            as={Link}
                            href="/#booth"
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
                            เพิ่มโซนบูท
                        </Button>
                    </HStack>
                </Flex>

                {loading ? (
                    <Flex justify="center" align="center" minH="200px">
                        <Text color="gray.500">กำลังโหลดข้อมูลบูทและโซน...</Text>
                    </Flex>
                ) : booths.length === 0 ? (
                    <Box
                        p={8}
                        bg={cardBg}
                        border="1px solid"
                        borderColor={borderColor}
                        rounded="xl"
                        textAlign="center"
                    >
                        <Text color="gray.500" mb={4}>
                            ยังไม่มีข้อมูลโซนบูท คลิกปุ่ม "+ เพิ่มโซนบูท" เพื่อสร้างโซนแรก
                        </Text>
                        <Button size="sm" colorScheme="orange" onClick={handleOpenAdd}>
                            + เพิ่มโซนบูท
                        </Button>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                        {booths.map((b, idx) => (
                            <Box
                                key={b.id}
                                p={5}
                                bg={cardBg}
                                border="1px solid"
                                borderColor={borderColor}
                                borderLeft={`6px solid ${PRIMARY}`}
                                rounded="xl"
                                shadow="sm"
                                opacity={b.display ? 1 : 0.6}
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-between"
                                position="relative"
                                transition="all 0.2s ease"
                                _hover={{ shadow: "md" }}
                            >
                                <Box>
                                    {/* Card Header with badges and reorder */}
                                    <Flex justify="space-between" align="center" mb={3}>
                                        <Badge colorScheme="orange" rounded="md" px={2} py={0.5}>
                                            ลำดับที่ {idx + 1}
                                        </Badge>

                                        <HStack spacing={1}>
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
                                                isDisabled={idx === booths.length - 1}
                                                onClick={() => handleMove(idx, "down")}
                                            />
                                        </HStack>
                                    </Flex>

                                    {/* Location Title */}
                                    <Heading size="sm" color={PRIMARY} mb={3} lineHeight="short">
                                        {b.location}
                                    </Heading>

                                    {/* Units */}
                                    <Stack spacing={1.5} mb={4}>
                                        {b.units.map((unit, uIdx) => (
                                            <Text key={uIdx} fontSize="xs" color={textColor} lineHeight="1.5">
                                                • {unit}
                                            </Text>
                                        ))}
                                    </Stack>
                                </Box>

                                {/* Card Footer Actions */}
                                <Box pt={3} borderTop="1px solid" borderColor={borderColor}>
                                    <Flex justify="space-between" align="center">
                                        <HStack spacing={2}>
                                            <Switch
                                                colorScheme="orange"
                                                isChecked={b.display}
                                                onChange={() => handleToggleDisplay(b)}
                                            />
                                            <Text fontSize="xs" color="gray.500">
                                                {b.display ? "แสดงบนหน้าแรก" : "ซ่อนอยู่"}
                                            </Text>
                                        </HStack>

                                        <HStack spacing={2}>
                                            <IconButton
                                                aria-label="Edit"
                                                icon={<EditIcon />}
                                                size="sm"
                                                colorScheme="orange"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(b)}
                                            />
                                            <IconButton
                                                aria-label="Delete"
                                                icon={<DeleteIcon />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => {
                                                    setBoothToDelete(b);
                                                    onDeleteOpen();
                                                }}
                                            />
                                        </HStack>
                                    </Flex>
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}

                {/* Add / Edit Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader color={PRIMARY}>
                            {editingBooth ? "แก้ไขโซนบูท" : "เพิ่มโซนบูทใหม่"}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">
                                        ชื่อโซน / สถานที่ (เช่น โซนที่ 3: KMUTT Industry Consultation Clinic)
                                    </FormLabel>
                                    <Input
                                        placeholder="เช่น โซนที่ 3: KMUTT Industry Consultation Clinic"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <Flex justify="space-between" align="center" mb={1}>
                                        <FormLabel fontSize="sm" mb={0}>
                                            รายการหน่วยงาน / กิจกรรมย่อย (Bullet Points)
                                        </FormLabel>
                                        <Button
                                            size="xs"
                                            colorScheme="orange"
                                            variant="outline"
                                            onClick={() => setUnits([...units, ""])}
                                        >
                                            + เพิ่มรายการ
                                        </Button>
                                    </Flex>

                                    <VStack spacing={2} align="stretch" mt={2}>
                                        {units.map((u, uIdx) => (
                                            <HStack key={uIdx} spacing={2}>
                                                <Input
                                                    size="sm"
                                                    placeholder={`รายการที่ ${uIdx + 1}`}
                                                    value={u}
                                                    onChange={(e) => {
                                                        const copy = [...units];
                                                        copy[uIdx] = e.target.value;
                                                        setUnits(copy);
                                                    }}
                                                />
                                                {units.length > 1 && (
                                                    <IconButton
                                                        aria-label="Remove unit"
                                                        icon={<DeleteIcon />}
                                                        size="xs"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setUnits(units.filter((_, i) => i !== uIdx));
                                                        }}
                                                    />
                                                )}
                                            </HStack>
                                        ))}
                                    </VStack>
                                </FormControl>

                                <Divider />

                                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                    <FormLabel fontSize="sm" mb="0">
                                        เปิดแสดงผลโซนนี้บนหน้าแรก
                                    </FormLabel>
                                    <Switch
                                        colorScheme="orange"
                                        isChecked={display}
                                        onChange={(e) => setDisplay(e.target.checked)}
                                    />
                                </FormControl>

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

                {/* Delete Alert */}
                <AlertDialog
                    isOpen={isDeleteOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onDeleteClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                ยืนยันการลบโซนบูท
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                คุณแน่ใจหรือไม่ว่าต้องการลบ:{" "}
                                <Text as="span" fontWeight="bold" color="red.500">
                                    {boothToDelete?.location}
                                </Text>{" "}
                                ? การลบนี้จะไม่สามารถย้อนกลับได้
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose}>
                                    ยกเลิก
                                </Button>
                                <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                                    ลบโซนบูท
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Box>
        </KMAppLayout>
    );
}
