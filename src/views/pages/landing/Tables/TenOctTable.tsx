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
    TableContainer,
} from "@chakra-ui/react";

const TenOctTable = () => {
    return (
        <Accordion allowMultiple defaultIndex={[0]} >
            {/* กิจกรรมส่วนกลาง */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        กิจกรรมส่วนกลาง
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                    <TableContainer>
                        <Table sx={{ td: { lineHeight: "22px" }, th: { lineHeight: "22px" } }} size="sm">
                            <Thead>
                                <Tr >
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>เวลา</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} >กิจกรรม</Th>
                                    <Th fontSize={"sm"} color={"kmutt.100"} width={"20%"}>สถานที่</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>8:30 น. - 9:00 น.</Td>
                                    <Td>ลงทะเบียน</Td>
                                    <Td>Centre Hub ชั้น 1 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:00 น. - 10:30 น.</Td>
                                    <Td >
                                        พิธีเปิดกิจกรรม โดย รศ. ดร.สุวิทย์ แซ่เตีย อธิการบดี
                                        และกิจกรรมนำชมบูธของแต่ละคณะ
                                    </Td>
                                    <Td>ด้านหน้าศาลาวีรชน</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:30 น. - 12:00 น.</Td>
                                    <Td>
                                        “เสวนา Journey of Discovery: เวทีฮีลใจวัยรุ่น”<br />
                                        โดย รศ. ดร.กุลธิดา ธรรมวิภัชน์
                                        คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี
                                    </Td>
                                    <Td>ห้อง Auditorium ชั้น 3 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. - 18:00 น.</Td>
                                    <Td>
                                        School Music Contest<br />
                                        การแข่งขันวงดนตรีของโรงเรียนระดับมัธยม
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
                                        “ก๊าบก๊าบมาร์เกต สาขา FIET”<br />
                                        - ตลาดนัดและซุ้มกิจกรรมนักศึกษา ทั้ง 7 สาขาวิชา<br />
                                        - FIET Folksong Contest 2025<br />
                                        - FIET Cover Dance Contest 2025<br />
                                        - การประกวดชุดรีไซเคิล Theme: “Colorful FIET VIBES 2025”
                                    </Td>
                                    <Td>อาคาร S13</Td>
                                </Tr>
                                <Tr>
                                    <Td>18:00 น. - 21:00 น.</Td>
                                    <Td>
                                        “ก๊าบก๊าบมาร์เกต สาขาหลัก” เดินเล่นตลาดคราฟต์ พักเติมพลัง
                                        มุมอาหาร &amp; เครื่องดื่ม<br />
                                        และ “ก๊าบไนท์” หนังกลางแปลงชวนดูด้วยกัน
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
            </AccordionItem >

            {/* คณะวิศวกรรมศาสตร์ */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        คณะวิศวกรรมศาสตร์
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
                                    <Td>8:30 น. – 16:00 น.</Td>
                                    <Td>การแข่งขันนวัตกรรมสิ่งประดิษฐ์ (Science & Technology Idea Contest)</Td>
                                    <Td>อาคารสำนักหอสมุด (N10) ชั้น 1 ห้อง LIB108</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:00 น. – 16:00 น.</Td>
                                    <Td>
                                        Engineering Open House 2025 <br />
                                        - Workshop ภาควิชา x INNO-X <br />
                                        - พี่พาน้องเดินทัวร์
                                    </Td>
                                    <Td>อาคาร S4, S11, S12, S15</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:30 น. – 12:00 น.</Td>
                                    <Td>กิจกรรมแนะแนวผู้ปกครอง</Td>
                                    <Td>ห้องประชุม ชั้น 2 อาคาร S12</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. – 17:00 น.</Td>
                                    <Td>Engi’s Idol Talk</Td>
                                    <Td>ห้องประชุม ชั้น 2 อาคาร S12</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

            {/* คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี
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
                                    <Td>9:00 น. – 16:00 น.</Td>
                                    <Td>“FIET LAND ดินแดนแห่งการเรียนรู้” (Workshop 7 สาขาวิชา)</Td>
                                    <Td>อาคาร S13</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:30 น. – 16:00 น.</Td>
                                    <Td>
                                        การแข่งขันเทคนิคการถ่ายทอดความรู้
                                        นวัตกรรม สิ่งประดิษฐ์ทางด้านวิทยาศาสตร์และเทคโนโลยี
                                    </Td>
                                    <Td>
                                        Smart classroom ชั้น 2, ห้องคอมพิวเตอร์ CB30612 ชั้น 6,
                                        โถงชั้น 1 คณะครุศาสตร์ฯ
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

            {/* คณะสถาปัตยกรรมศาสตร์และการออกแบบ */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        คณะสถาปัตยกรรมศาสตร์และการออกแบบ
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
                                    <Td>9:00 น. – 16:00 น.</Td>
                                    <Td>SoA+D Exhibition</Td>
                                    <Td>อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. – 16:00 น.</Td>
                                    <Td>PICKNIC BAZAAR</Td>
                                    <Td>อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. – 16:00 น.</Td>
                                    <Td>DIY Creative Workshops</Td>
                                    <Td>อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:00 น. – 16:00 น.</Td>
                                    <Td>Portfolio Clinic</Td>
                                    <Td>อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. – 14:30 น.</Td>
                                    <Td>
                                        Mock Classroom (5 Programs: Architecture, Interior, Landscape,
                                        Design Innovation, Communication Design)
                                    </Td>
                                    <Td>อาคาร A2 มจธ. บางขุนเทียน</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. – 15:30 น.</Td>
                                    <Td>
                                        Entrepreneurship Workshop from MIDI
                                        (Multiple Intelligences for Design Integration Program)
                                    </Td>
                                    <Td>คณะศิลปศาสตร์ ชั้น 1 อาคาร N15 มจธ. บางมด</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

            {/* คณะเทคโนโลยีสารสนเทศ */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        คณะเทคโนโลยีสารสนเทศ
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
                                    <Td>9:00 น. – 12:00 น.</Td>
                                    <Td>Workshop I: Computer Vision with Deep Learning</Td>
                                    <Td>ห้อง 10/3 ชั้น 10 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:00 น. – 12:00 น.</Td>
                                    <Td>
                                        Workshop II: พลิกโฉมการวิเคราะห์ข้อมูลอนาคตด้วย Power BI และ AI Agents
                                    </Td>
                                    <Td>ห้อง 10/4 และ 10/5 ชั้น 10 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>9:30 น. – 16:00 น.</Td>
                                    <Td>Digital Technology Aptitude Test</Td>
                                    <Td>ห้อง 10/1–10/2 และ 10/5 ชั้น 10 อาคาร LX</Td>
                                </Tr>
                                <Tr>
                                    <Td>13:30 น. – 16:00 น.</Td>
                                    <Td>SIT Talk / Tech Talk / Alumni Talk</Td>
                                    <Td>Auditorium ชั้น 3 อาคาร LX</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

            {/* คณะศิลปศาสตร์ */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        คณะศิลปศาสตร์
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
                                    <Td>10:00 น. – 16:00 น.</Td>
                                    <Td>SoLA So Cool: ก้าวสู่พลเมืองโลกอย่างเข้มแข็ง</Td>
                                    <Td>ชั้น 1 อาคาร N15</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

            {/* GMI */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        บัณฑิตวิทยาลัยการจัดการและนวัตกรรม
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
                                    <Td>9:00 น. – 16:00 น.</Td>
                                    <Td>กิจกรรม “แชะ แชร์ เช็คอิน”</Td>
                                    <Td>GMI ชั้น 1 อาคาร N19</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

            {/* FIBO */}
            < AccordionItem >
                <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="bold">
                        สถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO)
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
                                    <Td>10:00 น. – 16:00 น.</Td>
                                    <Td>FIBO Tour</Td>
                                    <Td>อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. – 16:00 น.</Td>
                                    <Td>Portfolio Clinic</Td>
                                    <Td>อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. – 16:00 น.</Td>
                                    <Td>FIBO Workshop</Td>
                                    <Td>อาคาร N9</Td>
                                </Tr>
                                <Tr>
                                    <Td>10:00 น. – 16:00 น.</Td>
                                    <Td>Showcase Technology (ผลงานนวัตกรรมและวิจัย)</Td>
                                    <Td>อาคาร N9</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </AccordionPanel>
            </AccordionItem >

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

export default TenOctTable;
