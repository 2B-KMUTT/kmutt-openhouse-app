"use client"

import { useState } from "react"
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Alert,
    AlertIcon,
    Heading,
    Text,
    VStack,
    Center,
    useColorModeValue,
    Spinner,
} from "@chakra-ui/react"
import Link from "next/link"
import { ArrowBackIcon, EmailIcon } from "@chakra-ui/icons"
import Head from "next/head"

import { PRIMARY, SECONDARY } from "@/constants/colors"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess(false)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (res.ok) {
                setSuccess(true)
            } else {
                const data = await res.json()
                setError(data.message || "ไม่สามารถส่งอีเมลได้")
            }
        } catch (err) {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsLoading(false)
        }
    }

    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    return (
        <Center
            minH="100vh"
            bgGradient={`linear(to-br, ${SECONDARY}50, ${PRIMARY}80)`}
            p={4}
        >
            <Head>
                <title>Openhouse - ลืมรหัสผ่าน</title>
            </Head>

            <VStack spacing={6} w="full" maxW="md">
                {/* Back Button */}
                <Link href="/login">
                    <Button
                        leftIcon={<ArrowBackIcon />}
                        variant="link"
                        color="white"
                        _hover={{ color: SECONDARY }}
                    >
                        กลับเข้าสู่ระบบ
                    </Button>
                </Link>

                {/* Forgot Password Card */}
                <Box
                    bg={cardBg}
                    p={8}
                    rounded="2xl"
                    shadow="xl"
                    w="full"
                    border="1px solid"
                    borderColor={useColorModeValue("orange.100", "gray.700")}
                >
                    <VStack spacing={4} align="stretch">
                        <Center mb={4}>
                            <EmailIcon w={10} h={10} color={PRIMARY} />
                        </Center>

                        <Heading textAlign="center" size="lg" color={PRIMARY}>
                            ลืมรหัสผ่าน
                        </Heading>

                        <Text textAlign="center" color={textColor}>
                            กรอกอีเมลที่ใช้สมัครเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
                        </Text>

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">
                                <FormControl id="email" isRequired>
                                    <FormLabel>อีเมล</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </FormControl>

                                {error && (
                                    <Alert status="error" rounded="md">
                                        <AlertIcon />
                                        {error}
                                    </Alert>
                                )}

                                {success && (
                                    <Alert status="success" rounded="md">
                                        <AlertIcon />
                                        ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    bg={PRIMARY}
                                    color="white"
                                    _hover={{ bg: "#d63e1a" }}
                                    w="full"
                                    isDisabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner size="sm" mr={2} /> กำลังส่ง...
                                        </>
                                    ) : (
                                        "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                                    )}
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                </Box>
            </VStack>
        </Center>
    )
}
