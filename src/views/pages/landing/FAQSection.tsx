"use client";

import {
    Box,
    Heading,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Text,
    Card,
    CardBody,
} from "@chakra-ui/react";

type FAQ = {
    id: number;
    question: string;
    answer: string;
};

const faqs: FAQ[] = [
    {
        id: 1,
        question: "ต้องลงทะเบียนล่วงหน้าก่อนเข้าร่วมงานหรือไม่",
        answer:
            "ควรลงทะเบียนล่วงหน้า โดยเฉพาะนักเรียนต้องลงทะเบียนล่วงหน้า ผ่านเว็บไซต์ https://openhouse.kmutt.ac.th เพื่อใช้งานระบบ Passport และรับ e-Stamp",
    },
    {
        id: 2,
        question: "Passport และ e-Stamp คืออะไร",
        answer: `Passport: บัตรผ่านดิจิทัล (QR Code) สำหรับเข้างาน KMUTT Open House และใช้ในการเข้าร่วมกิจกรรมต่าง ๆ
e-Stamp: ตราประทับอิเล็กทรอนิกส์ที่สะสมผ่านระบบเมื่อเข้าร่วมกิจกรรมนั้น ๆ หากสะสมครบตามกำหนดจะได้รับสิทธิพิเศษตามเงื่อนไขของแต่ละคณะ
หมายเหตุ: จะมีเมนู "My Passport" เพื่อใช้ในวันงาน`,
    },
    {
        id: 3,
        question: "ถ้าลงทะเบียนแล้ว ต้องจอง Workshop ต่างหากหรือไม่",
        answer: `ต้องลงทะเบียนจองกิจกรรม/Workshop แยก โดยมีขั้นตอนดังนี้
1. ลงทะเบียนเข้าร่วมงาน ผ่านเว็บไซต์ https://openhouse.kmutt.ac.th
2. ล็อกอินเข้าสู่ระบบ และลงทะเบียนเข้าร่วมกิจกรรม/Workshop ของคณะ/ภาควิชา/หน่วยงาน ตามที่สนใจ`,
    },
    {
        id: 4,
        question: "1 คนสามารถจองกิจกรรม/Workshop ได้กี่รอบ/กี่กิจกรรม",
        answer:
            "ไม่จำกัดจำนวนกิจกรรม แต่ช่วงเวลาที่จองจะต้องไม่ตรงกับที่ลงทะเบียนจองไว้ก่อนหน้า",
    },
    {
        id: 5,
        question: "ถ้ากิจกรรม/Workshop เต็มแล้วจะทำอย่างไร",
        answer:
            "แนะนำให้เลือก กิจกรรม/Workshop อื่นที่สนใจแทน หรือรอ Walk-in หน้างาน",
    },
    {
        id: 6,
        question: "สามารถยกเลิกการจอง กิจกรรม/Workshop ได้หรือไม่",
        answer: `สามารถยกเลิกได้ ดำเนินการดังนี้
1. เข้าสู่ระบบ ผ่านเว็บไซต์ https://openhouse.kmutt.ac.th
2. เลือกเมนู “กิจกรรมที่ลงทะเบียน”
3. เลือกกิจกรรมที่ต้องการยกเลิก และทำการยกเลิกภายในเวลาที่กำหนด`,
    },
    {
        id: 7,
        question: "ต้องแสดงหลักฐานอะไรในวันงาน",
        answer:
            "แสดง Passport ณ จุดลงทะเบียนของแต่ละกิจกรรม เพื่อยืนยันตัวตนและรับ e-Stamp",
    },
    {
        id: 8,
        question: "ถ้าไม่ได้ลงทะเบียนล่วงหน้า สามารถ Walk-in ได้ไหม",
        answer:
            "สามารถ Walk-in ได้ แต่แนะนำให้ลงทะเบียนล่วงหน้าเพื่อความสะดวกและเพื่อให้มั่นใจว่าจะมีสิทธิ์เข้าร่วม Workshop ที่สนใจ (Walk-in มีสิทธิ์เฉพาะที่นั่งเหลือเท่านั้น)",
    },
    {
        id: 9,
        question: "ได้รับเกียรติบัตรหรือไม่",
        answer: "ขึ้นอยู่กับเงื่อนไขการเข้าร่วมกิจกรรมของแต่ละคณะ/ภาควิชา",
    },
    {
        id: 10,
        question: "ลงทะเบียนเข้าร่วมกิจกรรมได้ถึงวันไหน",
        answer: "โปรดลงทะเบียนเข้าร่วมกิจกรรมล่วงหน้า ภายในวันจันทร์ที่ 26 ตุลาคม 2569",
    },
    {
        id: 11,
        question: "ต้องแต่งกายอย่างไร",
        answer:
            "แต่งกายด้วยชุดนักเรียน ชุดพละ หรือชุดสุภาพ กางเกงขายาว รองเท้าหุ้มส้น (ไม่ควรใส่เสื้อแขนกุด เสื้อสายเดี่ยว เสื้อเอวลอย กางเกงขาสั้น หรือรองเท้าแตะ)",
    },
    {
        id: 12,
        question: "หากพบปัญหาเกี่ยวกับการใช้งาน สามารถสอบถามผ่านช่องทางใด",
        answer:
            "สามารถสอบถามผ่าน Line OpenChat https://kmutt.me/OpenChatOPH2025",
    },
];

const FAQSection = () => {
    return (
        <Box py={12} px={6} maxW="900px" mx="auto">
            <Heading mb={8} textAlign="center" color="#F04E23">
                คำถามที่พบบ่อย
            </Heading>

            <Card shadow="md" borderWidth="1px">
                <CardBody>
                    <Accordion allowToggle>
                        {faqs.map((faq) => (
                            <AccordionItem key={faq.id} border="none">
                                <h2>
                                    <AccordionButton
                                        _expanded={{
                                            bg: "orange.50",   // พื้นหลังส้มอ่อน
                                            color: "orange.700", // ตัวอักษรส้มเข้ม
                                            fontWeight: "bold",
                                        }}
                                    // _hover={{
                                    //     bg: "orange.100",  // hover เป็นส้มอ่อนกว่าหน่อย
                                    // }}
                                    >
                                        <Box flex="1" textAlign="left" fontWeight="semibold">
                                            {faq.id}. {faq.question}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <Text fontSize={"md"} lineHeight={"short"} whiteSpace="pre-line">{faq.answer}</Text>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardBody>
            </Card>
        </Box>
    );
};

export default FAQSection;
