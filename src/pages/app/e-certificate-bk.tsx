"use client";

import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import StudentAppLayout from "@/views/layouts/StudentAppLayout";
import {
    Box,
    Flex,
    Heading,
    Text,
    Spinner,
    Badge,
    Button,
    useColorModeValue,
    Center,
} from "@chakra-ui/react";
import { DownloadIcon, LockIcon } from "@chakra-ui/icons";
import Head from "next/head";
import jsPDF from "jspdf";

interface CertificateStatus {
    canDownload: boolean;
    totalPoints: number;
    studentName: string;
}

const ECertificate = () => {
    const bgColor = useColorModeValue("white", "gray.800");

    const [status, setStatus] = useState<CertificateStatus | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔹 ดึงข้อมูลคะแนนจาก backend
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/student/engineering-points");
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Fetch failed");

                setStatus({
                    canDownload: data.student.can_download,
                    totalPoints: data.student.total_points,
                    studentName: data.student.name ?? "ไม่ทราบชื่อ",
                });
            } catch (err) {
                console.error("Error fetching certificate status:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    // ✅ ฟังก์ชัน helper แปลง ArrayBuffer เป็น Base64 แบบไม่กิน stack
    function arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000; // 32KB ต่อรอบ
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        return btoa(binary);
    }

    // ✅ ฟังก์ชัน generate PDF
    const handleDownload = async () => {
        if (!status) return;

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: "a4",
        });

        // โหลดพื้นหลัง
        const img = await fetch("/cert-bg.png");
        const blob = await img.blob();
        const reader = new FileReader();

        reader.onloadend = async function () {
            const imgData = reader.result as string;

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // วางภาพพื้นหลังแบบ fit
            pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

            // โหลดฟอนต์ภาษาไทย (TH Sarabun New)
            const fontRes = await fetch("/fonts/THSarabunNew.ttf");
            const fontBlob = await fontRes.arrayBuffer();
            const fontBase64 = arrayBufferToBase64(fontBlob);

            pdf.addFileToVFS("THSarabunNew.ttf", fontBase64);
            pdf.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
            pdf.setFont("THSarabunNew", "normal");

            // ตั้งค่าขนาดตัวอักษรและตำแหน่ง
            pdf.setFontSize(36);
            pdf.setTextColor(40, 40, 40);
            pdf.text(status.studentName, pageWidth / 2, pageHeight / 2 + 30, { align: "center" });

            pdf.save(`KMUTT_ECertificate_${status.studentName}.pdf`);
        };

        reader.readAsDataURL(blob);
    };

    if (loading) {
        return (
            <StudentAppLayout navigation="E-Certificate">
                <Center h="80vh">
                    <Spinner size="xl" />
                </Center>
            </StudentAppLayout>
        );
    }

    return (
        <StudentAppLayout navigation="E-Certificate">
            <Head>
                <title>Openhouse / E-Certificate</title>
            </Head>

            <Box p={6}>
                <Heading size="lg" mb={6}>
                    E-Certificate
                </Heading>

                <Box
                    bg={bgColor}
                    rounded="2xl"
                    shadow="md"
                    p={6}
                    maxW="3xl"
                    mx="auto"
                    borderWidth="1px"
                >
                    <Flex align="center" justify="space-between" flexWrap="wrap">
                        <Box>
                            <Heading size="md" mb={2}>
                                เกียรติบัตรคณะวิศวกรรมศาสตร์
                            </Heading>
                            <Text color="gray.500" fontSize="sm">
                                คะแนนกิจกรรมสะสม:{" "}
                                <Badge colorScheme={status!.canDownload ? "green" : "red"}>
                                    {status!.totalPoints} คะแนน
                                </Badge>
                            </Text>
                        </Box>

                        {status!.canDownload ? (
                            <Button
                                colorScheme="orange"
                                leftIcon={<DownloadIcon />}
                                onClick={handleDownload}
                            >
                                ดาวน์โหลด
                            </Button>
                        ) : (
                            <Button
                                leftIcon={<LockIcon />}
                                colorScheme="gray"
                                variant="outline"
                                isDisabled
                            >
                                ยังไม่ผ่านเกณฑ์ (≥ 5 คะแนน)
                            </Button>
                        )}
                    </Flex>
                </Box>
            </Box>
        </StudentAppLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        redirect: {
            destination: "/app/dashboard",
            permanent: false,
        },
    };
};

export default ECertificate;
