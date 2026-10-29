"use client"

import React, { useEffect } from "react"
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    useDisclosure,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { isSurveyModalActive } from "@/constants/event"

export const SURVEY_STORAGE_KEY = "doneSurveyXSIT"

interface SurveyModalProps {
    forceOpen?: boolean
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ forceOpen = false }) => {
    const router = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        // Allows developers/admins to test or preview via query parameter ?previewSurveyModal=true
        const isPreview = router.query.previewSurveyModal === "true" || forceOpen

        if (isPreview) {
            const timer = setTimeout(onOpen, 600)
            return () => clearTimeout(timer)
        }

        const doneSurvey = localStorage.getItem(SURVEY_STORAGE_KEY)
        if (doneSurvey) {
            return
        }

        // Consult server-side real-world time evaluation & status config
        let isCancelled = false
        fetch("/api/survey/config")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch")
                return res.json()
            })
            .then((data) => {
                if (isCancelled) return
                // Check if survey is open (real-world time between Oct 30 and Nov 6, or forced open)
                if (data?.isOpen) {
                    const timer = setTimeout(onOpen, 1000)
                    return () => clearTimeout(timer)
                }
            })
            .catch(() => {
                if (isCancelled) return
                // Fallback to client-side clock check
                if (isSurveyModalActive()) {
                    const timer = setTimeout(onOpen, 1000)
                    return () => clearTimeout(timer)
                }
            })

        return () => {
            isCancelled = true
        }
    }, [router.query.previewSurveyModal, forceOpen, onOpen])

    const handleGoToSurvey = () => {
        onClose()
        router.push("/survey")
    }

    const handleDoneSurvey = () => {
        try {
            localStorage.setItem(SURVEY_STORAGE_KEY, "true")
        } catch (e) {
            console.error("localStorage error", e)
        }
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="orange.500">ทำแบบสอบถามหรือยัง?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontSize="md" mb={3}>
                        เพื่อพัฒนา Openhouse ให้ดียิ่งขึ้น รบกวนช่วยทำแบบสอบถามสั้น ๆ หน่อยนะคะ 😊
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="orange" mr={3} onClick={handleGoToSurvey}>
                        ไปทำแบบสอบถาม
                    </Button>
                    <Button variant="ghost" onClick={handleDoneSurvey}>
                        ทำแล้ว
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default SurveyModal
