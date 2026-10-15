"use client";

import { Button, ButtonProps, useToast } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import React, { useState } from "react";
import { MdLogout } from "react-icons/md";

export interface LogoutButtonProps extends ButtonProps {
    callbackUrl?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
}

export const LogoutButton = ({
    callbackUrl = "/login",
    showIcon = false,
    children = "ออกจากระบบ",
    ...props
}: LogoutButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await signOut({
                redirect: false,
            });
            window.location.href = callbackUrl;
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoading(false);
            toast({
                title: "เกิดข้อผิดพลาดในการออกจากระบบ",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Button
            onClick={handleLogout}
            isLoading={isLoading}
            loadingText="กำลังออกจากระบบ..."
            leftIcon={showIcon ? <MdLogout /> : undefined}
            {...props}
        >
            {children}
        </Button>
    );
};

export default LogoutButton;
