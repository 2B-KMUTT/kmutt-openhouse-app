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
    Image,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import {
    AddIcon,
    EditIcon,
    DeleteIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExternalLinkIcon,
    ViewIcon,
} from "@chakra-ui/icons";
import KMAppLayout from "@/views/layouts/KMAppLayout";
import { LandingBannerItem } from "@/interfaces/LandingContent";
import Link from "next/link";

const PRIMARY = "#F04E23";

export default function LandingBannerManager() {
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

    const [banners, setBanners] = useState<LandingBannerItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [editingBanner, setEditingBanner] = useState<LandingBannerItem | null>(null);
    const [altText, setAltText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [display, setDisplay] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Delete state
    const [bannerToDelete, setBannerToDelete] = useState<LandingBannerItem | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/km/landing/banner");
            if (!res.ok) throw new Error("Failed to load banners");
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "เกิดข้อผิดพลาดในการโหลดรูป Banner",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleOpenCreate = () => {
        setEditingBanner(null);
        setAltText("");
        setImageUrl("");
        setLinkUrl("");
        setDisplay(true);
        onOpen();
    };

    const handleOpenEdit = (item: LandingBannerItem) => {
        setEditingBanner(item);
        setAltText(item.altText || "");
        setImageUrl(item.imageUrl);
        setLinkUrl(item.linkUrl || "");
        setDisplay(item.display);
        onOpen();
    };

    const handleOpenDelete = (item: LandingBannerItem) => {
        setBannerToDelete(item);
        onDeleteOpen();
    };

    const handleSave = async () => {
        if (!imageUrl.trim()) {
            toast({
                title: "กรุณาระบุ URL รูปภาพ Banner",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                id: editingBanner?.id,
                altText: altText.trim() || null,
                imageUrl: imageUrl.trim(),
                linkUrl: linkUrl.trim() || null,
                display,
            };

            const method = editingBanner ? "PUT" : "POST";
            const res = await fetch("/api/km/landing/banner", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to save banner");
            }

            toast({
                title: editingBanner ? "อัปเดต Banner สำเร็จ" : "เพิ่ม Banner สำเร็จ",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
            fetchBanners();
        } catch (error: any) {
            toast({
                title: error.message || "เกิดข้อผิดพลาดในการบันทึก",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!bannerToDelete) return;

        try {
            const res = await fetch(`/api/km/landing/banner?id=${bannerToDelete.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to delete banner");
            }

            toast({
                title: "ลบ Banner เรียบร้อยแล้ว",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onDeleteClose();
            fetchBanners();
        } catch (error: any) {
            toast({
                title: error.message || "เกิดข้อผิดพลาดในการลบ",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleReorder = async (id: number, direction: "up" | "down") => {
        try {
            const res = await fetch("/api/km/landing/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "banner", id, direction }),
            });
            if (!res.ok) throw new Error("Failed to reorder");
            fetchBanners();
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาดในการสลับลำดับ",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }
    };

    const handleToggleDisplay = async (banner: LandingBannerItem) => {
        try {
            const res = await fetch("/api/km/landing/banner", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: banner.id,
                    display: !banner.display,
                }),
            });
            if (!res.ok) throw new Error("Failed to update display state");
            setBanners((prev) =>
                prev.map((b) => (b.id === banner.id ? { ...b, display: !b.display } : b))
            );
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }
    };

    const activeCount = banners.filter((b) => b.display).length;

    return (
        <KMAppLayout>
            <Box maxW="1200px" mx="auto" pb={12}>
                {/* Header */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={4}
                    mb={6}
                >
                    <Box>
                        <Heading size="lg" color={textColor} mb={1}>
                            🖼️ จัดการ Banner หน้าแรก (Carousel & Sliders)
                        </Heading>
                        <Text color="gray.500" fontSize="sm">
                            กำหนดรูปภาพแบนเนอร์หลักของหน้า Landing Page รองรับทั้งรูปเดี่ยวและสไลด์หลายรูป
                        </Text>
                    </Box>

                    <HStack spacing={3}>
                        <Link href="/" target="_blank">
                            <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<ViewIcon />}
                                colorScheme="orange"
                            >
                                ดูหน้าเว็บจริง
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            bg={PRIMARY}
                            _hover={{ bg: "#d6451f" }}
                            color="white"
                            leftIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                        >
                            เพิ่ม Banner ใหม่
                        </Button>
                    </HStack>
                </Flex>

                {/* Explanation Alert */}
                <Alert
                    status="info"
                    variant="subtle"
                    rounded="2xl"
                    border="1px solid"
                    borderColor="blue.200"
                    mb={6}
                >
                    <AlertIcon />
                    <Box fontSize="sm">
                        <Text fontWeight="bold">การแสดงผล Banner บนหน้าแรก:</Text>
                        <Text>
                            - หากมี Banner ที่เปิดใช้งาน <strong>1 รูป</strong>: จะแสดงผลเป็นรูปภาพเดี่ยวคงที่ (Static Hero Banner)
                        </Text>
                        <Text>
                            - หากมี Banner ที่เปิดใช้งาน <strong>มากกว่า 1 รูป</strong>: ระบบจะเปลี่ยนเป็น <strong>Carousel Slider อัตโนมัติ</strong> (มีปุ่มเลื่อนซ้าย-ขวา เลื่อนอัตโนมัติทุก 5 วินาที และจุด Indicator ให้กดเลือกดูได้)
                        </Text>
                        <Text color="blue.600" mt={1}>
                            ขณะนี้มี Banner ที่เปิดแสดงผลอยู่: <strong>{activeCount} รูป</strong> {activeCount > 1 ? "(โหมดสไลด์ Carousel)" : "(โหมดรูปเดี่ยว Static)"}
                        </Text>
                    </Box>
                </Alert>

                {/* Banner Cards List */}
                {loading ? (
                    <Text textAlign="center" py={12} color="gray.500">
                        กำลังโหลดข้อมูล Banner...
                    </Text>
                ) : banners.length === 0 ? (
                    <Box
                        bg={cardBg}
                        p={10}
                        rounded="2xl"
                        textAlign="center"
                        border="1px dashed"
                        borderColor={borderColor}
                    >
                        <Text color="gray.500" mb={4}>
                            ยังไม่มีรายการ Banner ในระบบ
                        </Text>
                        <Button
                            size="sm"
                            bg={PRIMARY}
                            _hover={{ bg: "#d6451f" }}
                            color="white"
                            leftIcon={<AddIcon />}
                            onClick={handleOpenCreate}
                        >
                            เพิ่ม Banner แรก
                        </Button>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {banners.map((item, index) => (
                            <Box
                                key={item.id}
                                bg={cardBg}
                                rounded="2xl"
                                overflow="hidden"
                                shadow="md"
                                border="1px solid"
                                borderColor={borderColor}
                                transition="all 0.2s"
                                _hover={{ shadow: "lg" }}
                            >
                                {/* Image Preview */}
                                <Box position="relative" h="200px" bg="gray.100">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.altText || "Banner"}
                                        w="100%"
                                        h="100%"
                                        objectFit="cover"
                                        fallback={
                                            <Flex justify="center" align="center" h="100%" color="gray.400">
                                                ไม่สามารถโหลดรูปภาพได้
                                            </Flex>
                                        }
                                    />
                                    <Badge
                                        position="absolute"
                                        top={3}
                                        left={3}
                                        colorScheme={item.display ? "green" : "gray"}
                                        fontSize="xs"
                                        px={2.5}
                                        py={1}
                                        rounded="md"
                                        shadow="sm"
                                    >
                                        {item.display ? "เปิดใช้งาน (Active)" : "ซ่อน (Inactive)"}
                                    </Badge>
                                    <Badge
                                        position="absolute"
                                        top={3}
                                        right={3}
                                        colorScheme="orange"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                        shadow="sm"
                                    >
                                        ลำดับที่ {item.orderIndex}
                                    </Badge>
                                </Box>

                                {/* Body */}
                                <Box p={5}>
                                    <Heading size="sm" mb={1} color={textColor} noOfLines={1}>
                                        {item.altText || `Banner #${item.id}`}
                                    </Heading>

                                    {item.linkUrl && (
                                        <HStack spacing={1} mb={4} color="orange.500" fontSize="xs">
                                            <ExternalLinkIcon />
                                            <Text noOfLines={1}>
                                                ลิงก์: {item.linkUrl}
                                            </Text>
                                        </HStack>
                                    )}

                                    <Divider mb={4} />

                                    {/* Action Bar */}
                                    <Flex justify="space-between" align="center">
                                        <HStack spacing={2}>
                                            <Switch
                                                colorScheme="orange"
                                                isChecked={item.display}
                                                onChange={() => handleToggleDisplay(item)}
                                                size="sm"
                                            />
                                            <Text fontSize="xs" color="gray.500">
                                                {item.display ? "แสดง" : "ซ่อน"}
                                            </Text>
                                        </HStack>

                                        <HStack spacing={1}>
                                            <IconButton
                                                aria-label="ย้ายขึ้น"
                                                icon={<ArrowUpIcon />}
                                                size="sm"
                                                variant="ghost"
                                                isDisabled={index === 0}
                                                onClick={() => handleReorder(item.id, "up")}
                                            />
                                            <IconButton
                                                aria-label="ย้ายลง"
                                                icon={<ArrowDownIcon />}
                                                size="sm"
                                                variant="ghost"
                                                isDisabled={index === banners.length - 1}
                                                onClick={() => handleReorder(item.id, "down")}
                                            />
                                            <IconButton
                                                aria-label="แก้ไข Banner"
                                                icon={<EditIcon />}
                                                size="sm"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(item)}
                                            />
                                            <IconButton
                                                aria-label="ลบ Banner"
                                                icon={<DeleteIcon />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleOpenDelete(item)}
                                            />
                                        </HStack>
                                    </Flex>
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}

                {/* Modal: Create / Edit Banner */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            {editingBanner ? "แก้ไข Banner" : "เพิ่ม Banner ใหม่"}
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">URL ของรูปภาพ (Image URL)</FormLabel>
                                    <Input
                                        placeholder="เช่น /banner/poster-roiet.jpg หรือ https://..."
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        size="sm"
                                    />
                                    <Text fontSize="2xs" color="gray.500" mt={1}>
                                        สามารถใส่เป็น path ในโปรเจกต์ เช่น <code>/banner/banner.jpg</code> หรือ URL รูปภาพออนไลน์
                                    </Text>
                                </FormControl>

                                {/* Image Preview Box */}
                                {imageUrl && (
                                    <Box
                                        h="120px"
                                        rounded="xl"
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        bg="gray.50"
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt="Preview"
                                            w="100%"
                                            h="100%"
                                            objectFit="cover"
                                            fallback={
                                                <Flex justify="center" align="center" h="100%" color="gray.400" fontSize="xs">
                                                    กำลังรอโหลดรูป...
                                                </Flex>
                                            }
                                        />
                                    </Box>
                                )}

                                <FormControl>
                                    <FormLabel fontSize="sm">คำอธิบายภาพ / ชื่อแบนเนอร์ (Alt Text)</FormLabel>
                                    <Input
                                        placeholder="เช่น เปิดเฮือน มจธ. (มดอีสาน) ครั้งที่ 1"
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
                                        size="sm"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm">ลิงก์ปลายทางเมื่อคลิก (Link URL - ไม่บังคับ)</FormLabel>
                                    <Input
                                        placeholder="เช่น https://kmutt.me/oph_RoiEt หรือ /activities"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        size="sm"
                                    />
                                </FormControl>

                                <Divider />

                                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                    <FormLabel fontSize="sm" mb="0">
                                        เปิดแสดงผล Banner นี้บนหน้าแรก
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
                            <Button variant="ghost" mr={3} onClick={onClose} size="sm">
                                ยกเลิก
                            </Button>
                            <Button
                                bg={PRIMARY}
                                _hover={{ bg: "#d6451f" }}
                                color="white"
                                isLoading={submitting}
                                onClick={handleSave}
                                size="sm"
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
                                ยืนยันการลบ Banner
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                คุณแน่ใจหรือไม่ว่าต้องการลบ Banner นี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onDeleteClose} size="sm">
                                    ยกเลิก
                                </Button>
                                <Button colorScheme="red" onClick={handleConfirmDelete} ml={3} size="sm">
                                    ลบ Banner
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Box>
        </KMAppLayout>
    );
}
