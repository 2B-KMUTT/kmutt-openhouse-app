"use client";

import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    Box,
    AccordionPanel,
    TableContainer
} from "@chakra-ui/react";

const ElevenOctTable = () => {
    return (
        <Accordion allowMultiple defaultIndex={[0]}>
            {/* กิจกรรมส่วนกลาง */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                            กิจกรรมส่วนกลาง
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:00 น. - 10:30 น.</Td>
                                    <Td>“เสวนา เทรน Ai กำลังจะปฏิวัติทุกอาชีพ”</Td>
                                    <Td>ห้อง Auditorium ชั้น 3 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:30 น. - 12:00 น.</Td>
                                    <Td>
                                        “เสวนา Journey of Discovery: Lessons from Inspiration”
                                        <br /> โดย TikToker สายครอบครัว, ติวเตอร์ชื่อดัง,
                                        Influencer ศิษย์เก่า
                                    </Td>
                                    <Td>ห้อง Auditorium ชั้น 3 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>E-Sport Contest โดย ชมรม E-Sport</Td>
                                    <Td>ชั้น 2 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>14:00 น. - 18:00 น.</Td>
                                    <Td>
                                        Open Show & Random Dance Contest <br /> โดย KMUTT Dance Club
                                    </Td>
                                    <Td>เวทีกิจกรรมกลาง ชั้น 1 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td fontSize={"sm"} color={"kmutt.100"} colSpan={3} textAlign="center" fontWeight="bold">
                                        ตลาดของกิน & ของทำมือ · Workshop สนุกๆ · กิจกรรมสันทนาการ · ดนตรีสด · หนังกลางแปลง
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>8:30 น. - 16:00 น.</Td>
                                    <Td>
                                        “ก๊าบก๊าบมาร์เกต สาขา FIET”
                                        <br />- ตลาดนัดและซุ้มกิจกรรมนักศึกษา ทั้ง 7 สาขาวิชา
                                        <br />- FIET Folksong Contest 2025
                                        <br />- FIET Cover Dance Contest 2025
                                        <br />- การประกวดชุดรีไซเคิล Theme: “Colorful FIET VIBES
                                        2025”
                                    </Td>
                                    <Td>อาคาร S13</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>
                                        “ก๊าบก๊าบมาร์เกต สาขา Fsci” จากห้องแล็บสู่ตลาด ไอเดีย
                                        จากสมการสู่ของกินและไอเท็มสุดเก๋
                                    </Td>
                                    <Td>อาคาร N6</Td>
                                </Tr>
                                <Tr>
                                    <Td>18:00 น. - 21:00 น.</Td>
                                    <Td>
                                        “ก๊าบก๊าบมาร์เกต สาขาหลัก” + “ก๊าบไนท์” หนังกลางแปลง
                                    </Td>
                                    <Td>บริเวณโดยรอบ ชั้น 1 อาคาร LX</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>

                    {/* Booth***************** */}
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Tr>
                                <Td fontSize={"sm"} color={"kmutt.100"} colSpan={3} textAlign="center" fontWeight="bold">
                                   บูทแนะนำหลักสูตรจากทุกคณะและหน่วยงานบริการการศึกษา  เวลา 08:30 – 16:30 น.
                                </Td>
                            </Tr>
                            <Tr>
                                <Td fontSize={"sm"} color={"kmutt.100"} fontWeight={"bold"} textAlign="center">
                                    สถานที่
                                </Td>
                                <Td fontSize={"sm"} color={"kmutt.100"} colSpan={2} fontWeight={"bold"}>คณะ/หน่วยงาน</Td>
                            </Tr>
                            <Tr>
                                <Td fontWeight="bold" verticalAlign="top">
                                    A1 – อาคารการเรียนรู้พหุวิทยาการ (N16) ชั้น 1
                                </Td>
                                <Td >
                                    • คณะเทคโนโลยีสารสนเทศ<br />
                                    • คณะวิทยาศาสตร์<br />
                                    • สถาบันหุ่นยนต์ภาคสนาม
                                </Td>
                            </Tr>

                            <Tr>
                                <Td fontWeight="bold" verticalAlign="top">
                                    A1 – อาคารการเรียนรู้พหุวิทยาการ (N16) ชั้น 3
                                </Td>
                                <Td >
                                    • โซนบัณฑิตศึกษา ได้แก่ คณะศิลปศาสตร์<br />
                                    • คณะทรัพยากรชีวภาพและเทคโนโลยี<br />
                                    • คณะพลังงานสิ่งแวดล้อมและวัสดุ<br />
                                    • บัณฑิตวิทยาลัยการจัดการและนวัตกรรม (GMI)<br />
                                    • บัณฑิตวิทยาลัยร่วมด้านพลังงานและสิ่งแวดล้อม (JGSEE)<br />
                                    • คณะวิศวกรรมศาสตร์<br />
                                    • คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี<br />
                                    • คณะวิทยาศาสตร์<br />
                                    • คณะเทคโนโลยีสารสนเทศ<br />
                                    • คณะสถาปัตยกรรมศาสตร์และการออกแบบ<br />
                                    • สถาบันวิทยาการหุ่นยนต์ภาคสนาม<br />
                                    • สำนักงานกิจการต่างประเทศ<br />
                                    • KMUTTWORKS<br />
                                    • สำนักงานคัดเลือกและสรรหานักศึกษา <br />
                                    • กลุ่มงานช่วยเหลือทางการเงินแก่นักศึกษา <br />
                                    • ชมรมติว
                                </Td>
                            </Tr>

                            <Tr>
                                <Td fontWeight="bold" verticalAlign="top">
                                    A3 – อาคารเรียนรวม 2 (CB 2)
                                </Td>
                                <Td >•บูทแนะนำกิจกรรมและชมรมของนักศึกษา</Td>
                            </Tr>

                            <Tr>
                                <Td fontWeight="bold" verticalAlign="top">
                                    A4 – คณะศิลปศาสตร์ (N15)
                                </Td>
                                <Td >
                                    • คณะศิลปศาสตร์ (GCDC-GEN)<br />
                                    • คณะสถาปัตยกรรมศาสตร์และการออกแบบ<br />
                                    • โครงการร่วมบริหารหลักสูตรมีเดียอาตส์และเทคโนโลยีมีเดีย<br />
                                    • มจธ. ราชบุรี
                                </Td>
                            </Tr>

                            <Tr>
                                <Td fontWeight="bold" verticalAlign="top">
                                    A5 – อาคารสำนักหอสมุด (N10)
                                </Td>
                                <Td>
                                    •บูทกิจกรรมสำนักหอสมุด<br />
                                    • คณะวิศวกรรมศาสตร์<br />
                                    • คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี
                                </Td>
                            </Tr>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* คณะวิศวกรรมศาสตร์ */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                            คณะวิศวกรรมศาสตร์
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>8:30 น. - 18:00 น.</Td>
                                    <Td>
                                        กิจกรรมแข่งขันตอบปัญหาวิชาการทางด้านวิศวกรรมศาสตร์ ครั้งที่
                                        4
                                    </Td>
                                    <Td>ชั้น 3 อาคารพระจอมเกล้าราชานุสรณ์ 190 ปี</Td>
                                </Tr>
                                <Tr>
                                    <Td>8:30 น. - 16:00 น.</Td>
                                    <Td>การแข่งขันทักษะทางด้านคอมพิวเตอร์ (Bangmod Hackathon)</Td>
                                    <Td>ชั้น 10 อาคาร S4</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>
                                        Engineering Open House 2025
                                        <br />- Workshop ภาควิชา x INNO-X
                                        <br />- พี่พาน้องเดินทัวร์
                                    </Td>
                                    <Td>อาคาร S4, S11, S12, S15</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:30 น. - 12:00 น.</Td>
                                    <Td>กิจกรรมแนะแนวผู้ปกครอง</Td>
                                    <Td>ห้องประชุมคณะวิศวกรรมศาสตร์ ชั้น 2 อาคาร S12</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. – 17:00 น.</Td>
                                    <Td>Engi’s Idol Talk</Td>
                                    <Td>ห้องประชุมคณะวิศวกรรมศาสตร์ ชั้น 2 อาคาร S12</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>


            {/* คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                            คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>
                                        การแข่งขันเทคนิคการถ่ายทอดความรู้
                                        <br />
                                        นวัตกรรมสิ่งประดิษฐ์ทางด้านวิทยาศาสตร์และเทคโนโลยี
                                    </Td>
                                    <Td>
                                        ห้อง Smart Classroom ชั้น 2,
                                        <br />
                                        ห้องคอมพิวเตอร์ CB30612 ชั้น 6,
                                        <br />
                                        โถงชั้น 1 คณะครุศาสตร์ฯ อาคาร S13
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>“FIET LAND ดินแดนแห่งการเรียนรู้” (Workshop 7 สาขาวิชา)</Td>
                                    <Td>อาคาร S13</Td>
                                </Tr>
                                <Tr>
                                    <Td>8:30 น. - 16:00 น.</Td>
                                    <Td>เวทีกิจกรรมครูแนะแนว</Td>
                                    <Td>
                                        หอประชุมเกียรติยศ ชั้น 8
                                        <br />
                                        และห้อง CB30912 ชั้น 9 อาคาร S13
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>


            {/* คณะสถาปัตยกรรมศาสตร์และการออกแบบ */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                            คณะสถาปัตยกรรมศาสตร์และการออกแบบ
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>SoA+D Exhibition</Td>
                                    <Td>คณะสถาปัตยกรรมศาสตร์และการออกแบบ อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>PICKNIC BAZAAR</Td>
                                    <Td>คณะสถาปัตยกรรมศาสตร์และการออกแบบ อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>DIY Creative Workshops</Td>
                                    <Td>คณะสถาปัตยกรรมศาสตร์และการออกแบบ อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>Portfolio Clinic</Td>
                                    <Td>คณะสถาปัตยกรรมศาสตร์และการออกแบบ อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>11:30 น. - 12:30 น.</Td>
                                    <Td>
                                        Mock Classroom from 5 programs<br />
                                        - Architecture<br />
                                        - Interior Architecture<br />
                                        - Landscape Architecture<br />
                                        - Design Innovation<br />
                                        - Communication Design
                                    </Td>
                                    <Td>คณะสถาปัตยกรรมศาสตร์และการออกแบบ อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. - 14:30 น.</Td>
                                    <Td>
                                        Mock Classroom from 5 programs<br />
                                        - Architecture<br />
                                        - Interior Architecture<br />
                                        - Landscape Architecture<br />
                                        - Design Innovation<br />
                                        - Communication Design
                                    </Td>
                                    <Td>คณะสถาปัตยกรรมศาสตร์และการออกแบบ อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. - 15:30 น.</Td>
                                    <Td>
                                        Entrepreneurship Workshop from MIDI <br />
                                        (Multiple Intelligences for Design Integration Program)
                                    </Td>
                                    <Td>คณะศิลปศาสตร์ ชั้น 1 อาคาร N15 มจธ. บางมด</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* คณะเทคโนโลยีสารสนเทศ */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                            คณะเทคโนโลยีสารสนเทศ
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:30 น. - 10:30 น.</Td>
                                    <Td>
                                        Inspire & Learn Sessions กิจกรรมถ่ายทอดประสบการณ์จากรุ่นพี่สู่น้อง ม.ปลายแบบสนุก เข้าใจง่าย รอบที่ 1<br />
                                        - One Hour with me IT Bangmod<br />
                                        - CS Plug n Play<br />
                                        - D-SI Station
                                    </Td>
                                    <Td>ห้อง 10/3 - 10/4 ชั้น 10 และ 11/5 ชั้น 11 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>11:00 น. - 12:00 น.</Td>
                                    <Td>
                                        Inspire & Learn Sessions กิจกรรมถ่ายทอดประสบการณ์จากรุ่นพี่สู่น้อง ม.ปลายแบบสนุก เข้าใจง่าย รอบที่ 2<br />
                                        - One Hour with me IT Bangmod<br />
                                        - CS Plug n Play<br />
                                        - D-SI Station
                                    </Td>
                                    <Td>ห้อง 10/3 - 10/4 ชั้น 10 และ 11/5 ชั้น 11 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:30 น. - 16:00 น.</Td>
                                    <Td>
                                        Digital Technology Aptitude Test<br />
                                        สอบวัดแววความเป็นนักเทคโนโลยีดิจิทัล เพื่อประเมินศักยภาพ ความถนัด และความสนใจ
                                    </Td>
                                    <Td>ห้อง 10/1 - 10/2 และ 10/5 ชั้น 10 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. – 16:00 น.</Td>
                                    <Td>
                                        Technology Digital Workshop จากหลักสูตร SIT<br />
                                        Topic: Gemini with Python Workshop<br />
                                        โดย ผศ. ดร.นิวรรณ วัฒนกิจรุ่งโรจน์
                                    </Td>
                                    <Td>ห้อง 10/3 ชั้น 10 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. – 16:00 น.</Td>
                                    <Td>MINI ICT CHALLENGE 2025: {'"'}TECH CLASH ARENA{'"'}
                                        <br /> รอบที่ 1: 13.30 น. - 14.30 น.
                                        <br /> รอบที่ 2: 15.00 น. - 16.00 น.
                                    </Td>
                                    <Td>ห้อง Auditorium ชั้น 3 อาคาร LX</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* คณะศิลปศาสตร์  */}

            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                            คณะศิลปศาสตร์
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>SoLA So Cool: ก้าวสู่พลเมืองโลกอย่างเข้มแข็ง</Td>
                                    <Td>คณะศิลปศาสตร์ ชั้น 1 อาคาร N15</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* คณะวิทยาศาสตร์ */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                            คณะวิทยาศาสตร์
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <TableContainer>
                        <Table size="sm" variant="simple">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>Open House คณะวิทยาศาสตร์/ Sci Tour</Td>
                                    <Td>Science Learning Space ชั้น 1 อาคาร N7</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* บัณฑิตวิทยาลัยการจัดการและนวัตกรรม */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                            บัณฑิตวิทยาลัยการจัดการและนวัตกรรม
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <TableContainer >
                        <Table size="sm" variant="simple">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:00 น. - 16:00 น.</Td>
                                    <Td>กิจกรรม “แชะ แชร์ เช็คอิน”</Td>
                                    <Td>GMI ชั้น 1 อาคาร N19</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* สถาบันวิทยาการหุ่นยนต์ภาคสนาม */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                            สถาบันวิทยาการหุ่นยนต์ภาคสนาม
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <TableContainer>
                        <Table size="sm" variant="simple">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>FIBO Tour</Td>
                                    <Td>สถาบันวิทยาการหุ่นยนต์ภาคสนาม อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>Portfolio clinic</Td>
                                    <Td>สถาบันวิทยาการหุ่นยนต์ภาคสนาม อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>FIBO Workshop</Td>
                                    <Td>สถาบันวิทยาการหุ่นยนต์ภาคสนาม อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>“Showcase technology” จัดแสดงผลงานนวัตกรรม เทคโนโลยี ฝ่ายการวิจัย การศึกษา ด้านวิทยาการหุ่นยนต์</Td>
                                    <Td>สถาบันวิทยาการหุ่นยนต์ภาคสนาม อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 16:00 น.</Td>
                                    <Td>Alumni Experience Sharing</Td>
                                    <Td>สถาบันวิทยาการหุ่นยนต์ภาคสนาม อาคาร N9</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* โครงการร่วมบริหารหลักสูตรมีเดียอาตส์และเทคโนโลยีมีเดีย */}
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                            โครงการร่วมบริหารหลักสูตรมีเดียอาตส์และเทคโนโลยีมีเดีย
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <TableContainer>
                        <Table size="sm" variant="simple">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"60%"}>กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>9:00 น. - 15:00 น.</Td>
                                    <Td lineHeight={"22px"}>
                                        Creative Media Open House
                                        <br />- Workshop Python
                                        <br />- Workshop Blender 3D
                                        <br />- Workshop Paint Your Pouch
                                        <br />Alumni Talk
                                        <br />- “เมื่อกราฟิกเจอวิทยาศาสตร์: อาชีพที่เชื่อมโลกดีไซน์กับการแพทย์” โดย ศิษย์เก่ามีเดียทางการแพทย์และวิทยาศาสตร์
                                        <br />- “Journey to PROGRAMMER“ โดย ศิษย์เก่าเทคโนโลยีมีเดีย
                                    </Td>
                                    <Td>
                                        อาคาร A1 เทคโนโลยีและศิลปประยุกต์
                                        <br />มหาวิทยาลัยเทคโนโลยี มจธ. บางขุนเทียน
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem>

            {/* มจธ ราชบุรี */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        มจธ. ราชบุรี
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} >กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>10:00 น. - 12:00 น.</Td>
                                    <Td>
                                        Basketball Robot Challenge
                                    </Td>
                                    <Td>N15 คณะศิลปศาสตร์: ชั้น 1</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. - 12:00 น.</Td>
                                    <Td>
                                        Coding for Solar Tracking System
                                    </Td>
                                    <Td>N15 คณะศิลปศาสตร์: ชั้น 2 ห้อง SoLA 209</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. - 15:00 น.</Td>
                                    <Td>
                                        Basketball Robot Challenge
                                    </Td>
                                    <Td>N15 คณะศิลปศาสตร์: ชั้น 1</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. - 15:00 น.</Td>
                                    <Td>
                                        Coding for Solar Tracking System
                                    </Td>
                                    <Td>N15 คณะศิลปศาสตร์: ชั้น 2 ห้อง SoLA 209</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

        </Accordion >
    );
};

export default ElevenOctTable;
