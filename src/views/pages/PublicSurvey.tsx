"use client"

import { useState } from "react"
import {
    Box,
    Text,
    VStack,
    HStack,
    Radio,
    RadioGroup,
    Checkbox,
    CheckboxGroup,
    Select,
    Button,
    SimpleGrid,
    Heading,
    Divider,
    useToast,
    Stack,
    Center,
    useColorModeValue,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import Head from "next/head"

const PublicSurvey = () => {
    const router = useRouter()
    const toast = useToast()
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.800", "gray.200")

    // Section 1
    const [participantType, setParticipantType] = useState("")
    const [educationLevel, setEducationLevel] = useState("")
    const [interestLevel, setInterestLevel] = useState("")
    const [preferredFaculty, setPreferredFaculty] = useState<string[]>([])

    // Section 2
    const [infoChannels, setInfoChannels] = useState<string[]>([])
    const [factors, setFactors] = useState<string[]>([])
    const [creditTransferInterest, setCreditTransferInterest] = useState("3")
    const [teachingMode, setTeachingMode] = useState("")
    const [confusionRanking, setConfusionRanking] = useState(["", "", ""])
    const [interestKMUTT, setInterestKMUTT] = useState("")

    const handleSubmit = async () => {
        if (!participantType) {
            toast({ title: "กรุณาเลือกประเภทผู้เข้าร่วม", status: "error" })
            return
        }

        const surveyData = {
            participantType,
            educationLevel,
            interestLevel,
            preferredFaculty,
            infoChannels,
            factors,
            creditTransferInterest,
            teachingMode,
            confusionRanking,
            interestKMUTT,
        }

        try {
            const res = await fetch("/api/survey", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(surveyData),
            })

            if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการส่งข้อมูล")

            toast({ title: "ส่งแบบสอบถามเรียบร้อยแล้ว", status: "success" })

            // Reset form
            setParticipantType("")
            setEducationLevel("")
            setInterestLevel("")
            setPreferredFaculty([])
            setInfoChannels([])
            setFactors([])
            setCreditTransferInterest("3")
            setTeachingMode("")
            setConfusionRanking(["", "", ""])
            setInterestKMUTT("")

            router.push("/")
        } catch (err) {
            console.error(err)
            toast({ title: "เกิดข้อผิดพลาด", status: "error" })
        }
    }

    return (
        <Box bgGradient="linear(to-b, #FFC23320, #F04E2330)" minH="100vh" py={10} px={{ base: 4, md: 10 }}>
            <Head>
                <title>แบบสอบถาม เปิดเฮือน มจธ. (KMUTT Open House)</title>
                <meta name="description" content="แบบสอบถาม เปิดเฮือน มจธ. (KMUTT Open House)" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Center mb={6}>
                <Heading fontSize={{ base: "2xl", md: "3xl" }} color="#F04E23" textAlign="center">
                    แบบสอบถาม เปิดเฮือน มจธ. (KMUTT Open House)
                </Heading>
            </Center>

            <Box maxW="900px" mx="auto" bg={cardBg} rounded="xl" shadow="xl" p={{ base: 6, md: 10 }}>
                <VStack spacing={6} align="stretch">

                    {/* ---------- Section 1 ---------- */}
                    <Box>
                        <Heading size="md" mb={3} color={textColor}>ส่วนที่ 1: ข้อมูลทั่วไป</Heading>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>1. ประเภทผู้เข้าร่วมกิจกรรม</Text>
                            <RadioGroup value={participantType} onChange={setParticipantType}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                    {["นักเรียน", "นักศึกษา", "ผู้ปกครอง", "คุณครู/อาจารย์", "บุคคลทั่วไป"].map((t) => (
                                        <Radio key={t} value={t} colorScheme="orange" size="sm">{t}</Radio>
                                    ))}
                                </SimpleGrid>
                            </RadioGroup>
                        </Box>

                        {participantType === "นักเรียน" && (
                            <>
                                <Box mb={4}>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>2. ระดับการศึกษา</Text>
                                    <RadioGroup value={educationLevel} onChange={setEducationLevel}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                            {[
                                                "ประถมศึกษา",
                                                "ประกาศนียบัตรวิชาชีพ (ปวช.)",
                                                "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
                                                "มัธยมศึกษาตอนต้น (ม.1-3)",
                                                "มัธยมศึกษาตอนปลาย (ม.4)",
                                                "มัธยมศึกษาตอนปลาย (ม.5)",
                                                "มัธยมศึกษาตอนปลาย (ม.6)",
                                            ].map((lvl) => (
                                                <Radio key={lvl} value={lvl} colorScheme="orange" size="sm">{lvl}</Radio>
                                            ))}
                                        </SimpleGrid>
                                    </RadioGroup>
                                </Box>

                                <Box mb={4}>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>3. ท่านมีความสนใจที่จะศึกษาต่อในระดับการศึกษาใด</Text>
                                    <RadioGroup value={interestLevel} onChange={setInterestLevel}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                            {["ปริญญาตรี", "ปริญญาโท/ปริญญาเอก", "เรียนหลักสูตรระยะสั้น"].map((lvl) => (
                                                <Radio key={lvl} value={lvl} colorScheme="orange" size="sm">{lvl}</Radio>
                                            ))}
                                        </SimpleGrid>
                                    </RadioGroup>
                                </Box>

                                <Box mb={4}>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>4. ท่านมีความสนใจที่จะศึกษาต่อในคณะใด (เลือกได้มากกว่า 1 ข้อ)</Text>
                                    <CheckboxGroup value={preferredFaculty} onChange={(values) => setPreferredFaculty(values as string[])}>
                                        <Stack spacing={2} direction="column">
                                            {[
                                                "คณะวิศวกรรมศาสตร์",
                                                "คณะวิทยาศาสตร์",
                                                "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
                                                "คณะเทคโนโลยีสารสนเทศ",
                                                "คณะสถาปัตยกรรมศาสตร์และการออกแบบ",
                                                "คณะพลังงานสิ่งแวดล้อมและวัสดุ",
                                                "คณะทรัพยากรชีวภาพและเทคโนโลยี",
                                                "คณะศิลปศาสตร์",
                                                "บัณฑิตวิทยาลัยการจัดการและนวัตกรรม",
                                                "สถาบันวิทยาการหุ่นยนต์ภาคสนาม",
                                                "บัณฑิตวิทยาลัยร่วมด้านพลังงานและสิ่งแวดล้อม",
                                                "วิทยาลัยสหวิทยาการ"
                                            ].map((faculty) => (
                                                <Checkbox key={faculty} value={faculty} colorScheme="orange">{faculty}</Checkbox>
                                            ))}
                                        </Stack>
                                    </CheckboxGroup>
                                </Box>
                            </>
                        )}
                    </Box>

                    <Divider />

                    {/* ---------- Section 2 ---------- */}
                    <Box>
                        <Heading size="md" mb={3} color={textColor}>ส่วนที่ 2: ข้อมูลด้านการประชาสัมพันธ์</Heading>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>1. ท่านได้รับข้อมูลข่าวสารผ่านช่องทางใด (เลือกได้มากกว่า 1 ข้อ)</Text>
                            <CheckboxGroup value={infoChannels} onChange={(v) => setInfoChannels(v as string[])}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                    {[
                                        "Facebook", "Instagram", "Tiktok", "Line", "Website", "CampHub", "สื่อบนรถโดยสารประจำทาง",
                                        "งาน Dek-D TCAS และอื่น ๆ", "Roadshow",
                                        "รุ่นพี่ที่โรงเรียน", "เพื่อน", "ศิษย์เก่า มจธ.", "ผู้ปกครอง เครือญาติ", "คุณครูที่โรงเรียน/ครูแนะแนว"
                                    ].map((c) => <Checkbox key={c} value={c} colorScheme="orange">{c}</Checkbox>)}
                                </SimpleGrid>
                            </CheckboxGroup>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>2. ปัจจัยที่ส่งผลต่อการเลือกศึกษาต่อ (เลือกได้มากกว่า 1 ข้อ)</Text>
                            <CheckboxGroup value={factors} onChange={(v) => setFactors(v as string[])}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                                    {[
                                        "ชื่อเสียงของมหาวิทยาลัย/คณะ/ภาควิชา",
                                        "ผลการจัดลำดับมหาวิทยาลัยในเวทีระดับโลก (Ranking)",
                                        "ความรู้ความสามารถของคณาจารย์ประจำมหาวิทยาลัย",
                                        "อาจารย์เข้าถึงง่าย",
                                        "มีงานทำหลังเรียนจบ",
                                        "โอกาสในการไปฝึกงาน/แลกเปลี่ยนในต่างประเทศ",
                                        "ผู้ปกครอง/ครอบครัว แนะนำ",
                                        "รุ่นพี่/มีรุ่นพี่ศึกษาอยู่ที่คณะฯ แนะนำ",
                                        "ครูที่โรงเรียน/ครูแนะแนว แนะนำ",
                                        "บรรยากาศและสภาพแวดล้อมน่าอยู่",
                                        "อุปกรณ์การเรียนการสอน ห้องแลป มีเครื่องมือครบ และทันสมัย",
                                        "กิจกรรม Open house/กิจกรรมแนะแนวการศึกษา/กิจกรรมค่ายที่จัดขึ้น โดยนักศึกษา มจธ. หรือมหาวิทยาลัย",
                                        "ทุนการศึกษา",
                                        "มีคณะ/สาขาวิชา ตรงตามความต้องการ/น่าสนใจ",
                                        "สะดวกต่อการเดินทาง/ใกล้บ้าน",
                                        "มีกิจกรรมนักศึกษาที่ตอบสนองความต้องการให้ทำระหว่างเรียน",
                                        "เป็นหลักสูตรปริญญาตรี ที่ใช้ระยะเวลาการเรียนน้อยกว่าระบบเดิม"
                                    ].map((f) => <Checkbox key={f} value={f} colorScheme="orange">{f}</Checkbox>)}
                                </SimpleGrid>
                            </CheckboxGroup>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>3. ถ้ามีหลักสูตรเรียนล่วงหน้าและเทียบโอนหน่วยกิต สนใจระดับใด</Text>
                            <Select size="sm" value={creditTransferInterest} onChange={(e) => setCreditTransferInterest(e.target.value)}>
                                {["5", "4", "3", "2", "1"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </Select>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>4. รูปแบบการเรียนการสอนที่สนใจ</Text>
                            <RadioGroup value={teachingMode} onChange={setTeachingMode}>
                                <HStack spacing={4} wrap="wrap">
                                    <Radio value="Online" size="sm" colorScheme="orange">Online</Radio>
                                    <Radio value="Onsite" size="sm" colorScheme="orange">Onsite</Radio>
                                </HStack>
                            </RadioGroup>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>5. จัดลำดับความสนใจของ 3 พระจอม</Text>
                            <HStack spacing={2} wrap="wrap">
                                {["อันดับ 1", "อันดับ 2", "อันดับ 3"].map((label, idx) => (
                                    <Select
                                        key={idx}
                                        size="sm"
                                        value={confusionRanking[idx]}
                                        placeholder={label}
                                        onChange={(e) => {
                                            const newRank = [...confusionRanking]
                                            newRank[idx] = e.target.value
                                            setConfusionRanking(newRank)
                                        }}
                                    >
                                        {[
                                            "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (มจธ.)",
                                            "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (มจพ.)",
                                            "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง (สจล.)"
                                        ]
                                            .filter((uni) => !confusionRanking.includes(uni) || confusionRanking[idx] === uni)
                                            .map((uni) => <option key={uni} value={uni}>{uni}</option>)}
                                    </Select>
                                ))}
                            </HStack>
                        </Box>

                        <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>6. สนใจเข้าศึกษาต่อใน มจธ. หรือไม่</Text>
                            <RadioGroup value={interestKMUTT} onChange={setInterestKMUTT}>
                                <HStack spacing={4} wrap="wrap">
                                    <Radio value="สนใจ" size="sm" colorScheme="orange">สนใจ</Radio>
                                    <Radio value="ไม่สนใจ" size="sm" colorScheme="orange">ไม่สนใจ</Radio>
                                </HStack>
                            </RadioGroup>
                        </Box>
                    </Box>

                    <Button colorScheme="orange" size="lg" onClick={handleSubmit}>
                        ส่งแบบสอบถาม
                    </Button>

                </VStack>
            </Box>
        </Box>
    )
}

export { PublicSurvey }
