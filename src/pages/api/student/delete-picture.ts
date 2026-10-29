import type { NextApiResponse } from "next"
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard"
import { deleteObjectByUrl } from "@/libs/s3"
import prisma from "@/libs/prisma"

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "DELETE") {
        res.status(405).end()
        return
    }

    try {
        const id = Number(req.query.id)
        if (!id) {
            res.status(400).json({ error: "Missing id" })
            return
        }

        // ตรวจสอบว่าเป็นรูปของ user ตัวเอง
        const picture = await prisma.takePicture.findUnique({ where: { id } })
        if (!picture) {
            res.status(404).json({ error: "Picture not found" })
            return
        }
        if (picture.studentId !== req.user.id) {
            res.status(403).json({ error: "Unauthorized" })
            return
        }

        // ลบไฟล์จริงออกจาก RustFS ผ่าน storage helper
        await deleteObjectByUrl(picture.image_url)

        // ลบเรคอร์ดออกจากฐานข้อมูล
        await prisma.takePicture.delete({ where: { id } })

        res.status(200).json({ message: "Deleted successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: (err as Error).message })
    }
}, ["student"])
