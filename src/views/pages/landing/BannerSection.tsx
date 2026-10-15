import { Box, Image } from "@chakra-ui/react";

const BannerSection = () => {
    return (
        <Box as="section" w="100%" py={{ base: 2, md: 6 }}>
            {/* Banner with responsive fit and max-width on large screens */}
            <Box maxW="7xl" mx="auto" px={{ base: 0, md: 6 }}>
                <Box
                    overflow="hidden"
                    rounded={{ base: "none", md: "2xl" }}
                    shadow={{ base: "none", md: "lg" }}
                >
                    <Image
                        src="/images/banner_new.png"
                        alt="เปิดเฮือน มจธ. KMUTT Open House 30 ตุลาคม 2569 ณ โรงแรมเพชรรัชต์ การ์เด้น จังหวัดร้อยเอ็ด"
                        objectFit="cover"
                        w="100%"
                        h="auto"
                        display="block"
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default BannerSection;
