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
    VStack,
    HStack,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import Head from "next/head";

interface CertItem {
    certName: string;
    downloadUrl: string;
}

const SITCertificatePage = () => {
    const bgColor = useColorModeValue("white", "gray.800");
    const cardBg = useColorModeValue("gray.50", "gray.700");

    const [certs, setCerts] = useState<CertItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const res = await fetch("/api/student/sit-certificates");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Fetch failed");

                setCerts(data.certificates);
            } catch (err) {
                console.error("Error fetching SIT certificates:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCerts();
    }, []);

    if (loading) {
        return (
            <StudentAppLayout navigation="SIT Certificate">
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

            <Box p={3}>
                <Heading size={{ base: "sm", md: "md" }} mb={3}>
                    คณะเทคโนโลยีสารสนเทศ (SIT)
                </Heading>

                <Box
                    // bg={bgColor}
                    // rounded="2xl"
                    // shadow="md"
                    p={0}
                    // maxW="3xl"
                    mx="auto"
                // borderWidth="1px"
                >
                    {certs.length === 0 ? (
                        <Center py={10}>
                            <Text color="gray.500" fontSize="lg">
                                ไม่พบเกียรติบัตรของ SIT ที่สามารถดาวน์โหลดได้ในขณะนี้
                            </Text>
                        </Center>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {certs.map((cert) => (
                                <Flex
                                    key={cert.certName}
                                    justify="space-between"
                                    align="center"
                                    p={4}
                                    borderWidth="1px"
                                    rounded="lg"
                                    bg={cardBg}
                                >
                                    <Box>
                                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                            {cert.certName}
                                        </Text>
                                        <Badge colorScheme="blue">SIT Certificate</Badge>
                                    </Box>

                                    <Button
                                        colorScheme="orange"
                                        onClick={() => window.open(cert.downloadUrl, "_blank")}
                                    >
                                        <DownloadIcon fontSize={{ base: "xs", md: "md" }} />
                                        <Text display={{ base: "none", md: "block" }}>ดาวน์โหลด</Text>
                                    </Button>
                                </Flex>
                            ))}
                        </VStack>
                    )}
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

export default SITCertificatePage;
