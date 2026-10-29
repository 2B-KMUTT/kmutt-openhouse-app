"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
} from "@chakra-ui/react"
import Head from "next/head"
import { LockIcon, CheckCircleIcon, ArrowBackIcon } from "@chakra-ui/icons"
import Link from "next/link"

import { PRIMARY, SECONDARY } from "@/constants/colors"

const ResetPasswordPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token") || ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!password || !confirmPassword) {
            setError("กรุณากรอกทั้งรหัสผ่านและยืนยันรหัสผ่าน")
            return
        }

        if (password !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "เกิดข้อผิดพลาด")
            }

            setSuccess("เปลี่ยนรหัสผ่านสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว")
            setPassword("")
            setConfirmPassword("")
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    return (
        <Center minH="100vh" bgGradient={`linear(to-br, ${SECONDARY}50, ${PRIMARY}80)`} p={4}>
            <Head>
                <title>Openhouse - Reset Password</title>
            </Head>

            <VStack spacing={6} w="full" maxW="md">
                {/* Back Button */}
                <Link href="/">
                    <Button
                        leftIcon={<ArrowBackIcon />}
                        variant="link"
                        color="white"
                        _hover={{ color: SECONDARY }}
                    >
                        กลับหน้าหลัก
                    </Button>
                </Link>

                {/* Reset Password Card */}
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
                            <LockIcon w={10} h={10} color={PRIMARY} />
                        </Center>
                        <Heading textAlign="center" size="lg" color={PRIMARY}>
                            ตั้งรหัสผ่านใหม่
                        </Heading>
                        <Text textAlign="center" color={textColor}>
                            กรุณากรอกรหัสผ่านใหม่ของคุณ
                        </Text>

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">
                                <FormControl id="password" isRequired>
                                    <FormLabel>รหัสผ่านใหม่</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="รหัสผ่านใหม่"
                                    />
                                </FormControl>

                                <FormControl id="confirmPassword" isRequired>
                                    <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="ยืนยันรหัสผ่าน"
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
                                        <CheckCircleIcon mr={2} />
                                        {success}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    bg={PRIMARY}
                                    color="white"
                                    _hover={{ bg: "#d63e1a" }}
                                    w="full"
                                    isLoading={isLoading}
                                >
                                    {isLoading ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                </Box>
            </VStack>
        </Center>
    )
}

export { ResetPasswordPage as default }
