import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box,
    useColorModeValue,
    TableContainer,
} from "@chakra-ui/react";

const BoothTable = () => {
    const bg = useColorModeValue("white", "gray.700");
    const text = useColorModeValue("gray.700", "gray.200");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    return (
        <TableContainer mt={10} mb={5}>
            <Table variant="striped" colorScheme="orange" bg={bg} borderColor={borderColor}>
                <Thead>
                    <Tr>
                        <Th color={text}>สถานที่</Th>
                        <Th color={text}>คณะ / หน่วยงาน</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td color={text} fontWeight="bold" verticalAlign="top">
                            A1 – อาคารการเรียนรู้พหุวิทยาการ (N16) ชั้น 1
                        </Td>
                        <Td color={text}>
                            • คณะเทคโนโลยีสารสนเทศ<br />
                            • คณะวิทยาศาสตร์<br />
                            • สถาบันหุ่นยนต์ภาคสนาม
                        </Td>
                    </Tr>

                    <Tr>
                        <Td color={text} fontWeight="bold" verticalAlign="top">
                            A1 – อาคารการเรียนรู้พหุวิทยาการ (N16) ชั้น 3
                        </Td>
                        <Td color={text}>
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
                            • สำนักงานคัดเลือกและสรรหานักศึกษา<br />
                            • Portfolio Clinic
                        </Td>
                    </Tr>

                    <Tr>
                        <Td color={text} fontWeight="bold" verticalAlign="top">
                            A3 – อาคารเรียนรวม 2 (CB 2)
                        </Td>
                        <Td color={text}>•บูทแนะนำกิจกรรมและชมรมของนักศึกษา</Td>
                    </Tr>

                    <Tr>
                        <Td color={text} fontWeight="bold" verticalAlign="top">
                            A4 – คณะศิลปศาสตร์ (N15)
                        </Td>
                        <Td color={text}>
                            • คณะศิลปศาสตร์ (GCDC-GEN)<br />
                            • คณะสถาปัตยกรรมศาสตร์และการออกแบบ<br />
                            • โครงการร่วมบริหารหลักสูตรมีเดียอาตส์และเทคโนโลยีมีเดีย<br />
                            • มจธ. ราชบุรี
                        </Td>
                    </Tr>

                    <Tr>
                        <Td color={text} fontWeight="bold" verticalAlign="top">
                            A5 – อาคารสำนักหอสมุด (N10)
                        </Td>
                        <Td color={text}>
                            •บูทกิจกรรมสำนักหอสมุด<br />
                            • คณะวิศวกรรมศาสตร์<br />
                            • คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default BoothTable;
