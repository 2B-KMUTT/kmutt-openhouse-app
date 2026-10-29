"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
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
    HStack,
    Center,
    useColorModeValue,
} from "@chakra-ui/react"
import { ArrowBackIcon, LockIcon } from "@chakra-ui/icons"
import Head from "next/head"

import { PRIMARY, SECONDARY } from "@/constants/colors"

const LoginPage = () => {
    const [emailOrUsername, setEmailOrUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { data: session, status } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        // Clear existing session before logging in to prevent session collisions
        if (status === "authenticated") {
            await signOut({ redirect: false })
        }

        const res = await signIn("credentials", {
            redirect: false,
            emailOrUsername,
            password,
        })

        if (res?.error) {
            setError("❌ Login failed: " + (res.error == "CredentialsSignin" ? "Invalid email or password" : res.error))
            setIsLoading(false)
            return
        }

        const sessionRes = await fetch("/api/auth/session")
        const newSession = await sessionRes.json()

        if (newSession?.user?.role === "student") {
            window.location.href = "/app/dashboard"
        } else if (newSession?.user?.role === "guest" || newSession?.user?.role === "parent" || newSession?.user?.role === "teacher") {
            window.location.href = "/guest/dashboard"
        } else if (newSession?.user?.role === "staff") {
            window.location.href = "/staff/dashboard"
        } else if (newSession?.user?.role === "kmuser") {
            window.location.href = "/_km/dashboard"
        } else {
            window.location.href = "/"
        }

        setIsLoading(false)
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
                <title>Openhouse - เข้าสู่ระบบ / Login</title>
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

                {/* Login Card */}
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
                            เข้าสู่ระบบ
                        </Heading>
                        <Text textAlign="center" color={textColor}>
                            กรอกอีเมล (นักเรียน) หรือ Username (เจ้าหน้าที่) และรหัสผ่าน
                        </Text>

                        {status === "authenticated" && session?.user && (
                            <Alert status="info" rounded="lg" flexDirection="column" alignItems="center" textAlign="center" py={4}>
                                <AlertIcon boxSize="24px" mr={0} mb={2} />
                                <Text fontWeight="bold">คุณกำลังเข้าสู่ระบบอยู่ในขณะนี้</Text>
                                <Text fontSize="sm" color="gray.600">
                                    {session.user.name || session.user.email} ({session.user.role || "user"})
                                </Text>
                                <HStack spacing={3} mt={3}>
                                    <Button
                                        size="sm"
                                        bg={PRIMARY}
                                        color="white"
                                        _hover={{ bg: "#d63e1a" }}
                                        onClick={() => {
                                            if (session.user.role === "student") window.location.href = "/app/dashboard";
                                            else if (session.user.role === "staff") window.location.href = "/staff/dashboard";
                                            else if (session.user.role === "kmuser") window.location.href = "/_km/dashboard";
                                            else window.location.href = "/guest/dashboard";
                                        }}
                                    >
                                        ไปที่แดชบอร์ด
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="red"
                                        onClick={async () => {
                                            await signOut({ redirect: false });
                                            window.location.href = "/login";
                                        }}
                                    >
                                        ออกจากระบบ (Sign Out)
                                    </Button>
                                </HStack>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">
                                <FormControl id="emailOrUsername" isRequired>
                                    <FormLabel>Email หรือ Username</FormLabel>
                                    <Input
                                        type="text"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        placeholder="Email หรือ Username"
                                    />
                                </FormControl>

                                <FormControl id="password" isRequired>
                                    <FormLabel>รหัสผ่าน</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="รหัสผ่าน"
                                    />
                                </FormControl>

                                {error && (
                                    <Alert status="error" rounded="md">
                                        <AlertIcon />
                                        {error}
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
                                    {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                                </Button>
                            </VStack>
                        </form>

                        <Text textAlign="center" fontSize="sm" color={textColor} mt={2}>
                            ไม่มีบัญชี?{" "}
                            <Link href="/register">
                                <Text
                                    as="span"
                                    color={PRIMARY}
                                    fontWeight="semibold"
                                    cursor="pointer"
                                >
                                    สมัครสมาชิก
                                </Text>
                            </Link>
                            <br />
                            ลืมรหัสผ่าน?{" "}
                            <Link href="/forgot-password">
                                <Text
                                    as="span"
                                    color={PRIMARY}
                                    fontWeight="semibold"
                                    cursor="pointer"
                                >
                                    คลิกที่นี่
                                </Text>
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </VStack>
        </Center>
    )
}

export { LoginPage }
