// src/pages/api/student/upload.ts
import type { NextApiResponse } from "next"
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard"
import { uploadObjectDirect } from "@/libs/s3"
import prisma from "@/libs/prisma"

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }

  try {
    const { base64 } = req.body as { base64?: string }
    if (!base64) {
      res.status(400).json({ error: "No image provided" })
      return
    }

    // ตรวจสอบจำนวนรูปที่นักเรียนอัปโหลดไปแล้ว
    const existingCount = await prisma.takePicture.count({
      where: { studentId: req.user.id }
    })
    if (existingCount >= 5) {
      res.status(400).json({ error: "อัปโหลดได้สูงสุด 5 รูปต่อคน" })
      return
    }

    // แปลง base64 เป็น buffer
    const matches = base64.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      res.status(400).json({ error: "Invalid base64 format" })
      return
    }

    const mimeType = matches[1]
    const data = matches[2]
    const buffer = Buffer.from(data, "base64")

    const ext = mimeType.split("/")[1] ?? "jpg"
    const objectKey = `take-pictures/openhouse-${Date.now()}.${ext}`

    // อัปโหลดเข้า RustFS ผ่าน S3 client
    const { publicUrl } = await uploadObjectDirect({
      key: objectKey,
      body: buffer,
      contentType: mimeType,
    })

    // บันทึกลง DB ด้วย root-relative path
    const uploaded = await prisma.takePicture.create({
      data: {
        studentId: req.user.id,
        image_url: publicUrl,
      },
    })

    res.status(200).json({ uploaded, publicUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: (err as Error).message })
  }
}, ["student"])
