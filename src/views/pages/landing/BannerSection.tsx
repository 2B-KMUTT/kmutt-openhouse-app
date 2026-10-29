"use client";

import { useState, useEffect, useRef } from "react";
import {
    Box,
    Image,
    IconButton,
    HStack,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { LandingBannerItem } from "@/interfaces/LandingContent";
import { KMUTT_CI } from "@/constants/colors";

const defaultBanner: LandingBannerItem = {
    id: 1,
    imageUrl: "/images/banner_new.png",
    altText: "เปิดเฮือน มจธ. KMUTT Open House 30 ตุลาคม 2569 ณ โรงแรมเพชรรัชต์ การ์เด้น จังหวัดร้อยเอ็ด",
    linkUrl: null,
    orderIndex: 1,
    display: true,
};

const BannerSection = () => {
    const [banners, setBanners] = useState<LandingBannerItem[]>([defaultBanner]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const activeDotColor = useColorModeValue(KMUTT_CI.orange, KMUTT_CI.yellow);
    const inactiveDotColor = useColorModeValue("blackAlpha.400", "whiteAlpha.400");

    useEffect(() => {
        fetch("/api/landing/banners")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch banners");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setBanners(data);
                }
            })
            .catch((err) => {
                console.error("Using default banner due to fetch error:", err);
            });
    }, []);

    // Autoplay when there are multiple banners
    useEffect(() => {
        if (banners.length <= 1 || isHovered) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [banners.length, isHovered]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const isMultiple = banners.length > 1;
    const currentBanner = banners[currentIndex] || defaultBanner;

    return (
        <Box
            as="section"
            w="100%"
            py={{ base: 2, md: 6 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box maxW="7xl" mx="auto" px={{ base: 0, md: 6 }}>
                <Box
                    position="relative"
                    overflow="hidden"
                    rounded={{ base: "none", md: "2xl" }}
                    shadow={{ base: "none", md: "lg" }}
                    bg="gray.100"
                    _dark={{ bg: "gray.800" }}
                >
                    {/* Banner Image / Slide */}
                    <Box
                        as={currentBanner.linkUrl ? "a" : "div"}
                        {...(currentBanner.linkUrl
                            ? { href: currentBanner.linkUrl, target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        display="block"
                        position="relative"
                        w="100%"
                        transition="all 0.4s ease-in-out"
                    >
                        <Image
                            key={currentBanner.id || currentIndex}
                            src={currentBanner.imageUrl}
                            alt={currentBanner.altText || "KMUTT Open House Banner"}
                            objectFit="cover"
                            w="100%"
                            h="auto"
                            display="block"
                        />
                    </Box>

                    {/* Navigation Arrows for multiple banners */}
                    {isMultiple && (
                        <>
                            <IconButton
                                aria-label="Previous Slide"
                                icon={<ChevronLeftIcon w={6} h={6} />}
                                position="absolute"
                                left={{ base: 2, md: 4 }}
                                top="50%"
                                transform="translateY(-50%)"
                                colorScheme="blackAlpha"
                                bg="blackAlpha.600"
                                color="white"
                                _hover={{ bg: "blackAlpha.800" }}
                                rounded="full"
                                size="sm"
                                zIndex={2}
                                onClick={handlePrev}
                            />
                            <IconButton
                                aria-label="Next Slide"
                                icon={<ChevronRightIcon w={6} h={6} />}
                                position="absolute"
                                right={{ base: 2, md: 4 }}
                                top="50%"
                                transform="translateY(-50%)"
                                colorScheme="blackAlpha"
                                bg="blackAlpha.600"
                                color="white"
                                _hover={{ bg: "blackAlpha.800" }}
                                rounded="full"
                                size="sm"
                                zIndex={2}
                                onClick={handleNext}
                            />

                            {/* Dot Indicators */}
                            <Flex
                                position="absolute"
                                bottom={3}
                                left="0"
                                right="0"
                                justify="center"
                                zIndex={2}
                            >
                                <HStack spacing={2} bg="blackAlpha.500" px={3} py={1} rounded="full" backdropFilter="blur(4px)">
                                    {banners.map((_, idx) => (
                                        <Box
                                            key={idx}
                                            w={currentIndex === idx ? "20px" : "8px"}
                                            h="8px"
                                            rounded="full"
                                            bg={currentIndex === idx ? activeDotColor : inactiveDotColor}
                                            cursor="pointer"
                                            transition="all 0.3s ease"
                                            onClick={() => setCurrentIndex(idx)}
                                        />
                                    ))}
                                </HStack>
                            </Flex>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default BannerSection;
