import { PrismaClient } from "@prisma/client"
import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"

const prisma = new PrismaClient()
const secret = process.env.NEXTAUTH_SECRET

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const {
        role,
        province,
        sourceChannels,
        // นักเรียน
        grade,
        stream,
        interestedFaculty,
        decisionFactors,
        worryPoints,
        // ผู้ปกครอง
        parentGrade,
        parentWorries,
        parentInfoNeeded,
        parentContactChannel,
        // ครูแนะแนว
        teacherNeeds,
        teacherCreditTransferInterest,
        teacherSchoolContact,
        // ปิดท้าย
        recommendIntent,
        overallSatisfaction,
        feedbackNote,
      } = req.body

      if (!role || !province) {
        return res.status(400).json({ error: "กรุณาระบุบทบาทและจังหวัด" })
      }

      const survey = await prisma.publicSurvey.create({
        data: {
          role: String(role),
          province: String(province),
          sourceChannels: Array.isArray(sourceChannels) ? sourceChannels : [],
          // นักเรียน
          grade: grade ? String(grade) : null,
          stream: stream ? String(stream) : null,
          interestedFaculty: Array.isArray(interestedFaculty) ? interestedFaculty : [],
          decisionFactors: Array.isArray(decisionFactors) ? decisionFactors : [],
          worryPoints: worryPoints ? String(worryPoints) : null,
          // ผู้ปกครอง
          parentGrade: parentGrade ? String(parentGrade) : null,
          parentWorries: Array.isArray(parentWorries) ? parentWorries : [],
          parentInfoNeeded: parentInfoNeeded ? String(parentInfoNeeded) : null,
          parentContactChannel: parentContactChannel ? String(parentContactChannel) : null,
          // ครูแนะแนว
          teacherNeeds: Array.isArray(teacherNeeds) ? teacherNeeds : [],
          teacherCreditTransferInterest: teacherCreditTransferInterest ? Number(teacherCreditTransferInterest) : null,
          teacherSchoolContact: teacherSchoolContact ? String(teacherSchoolContact) : null,
          // ปิดท้าย
          recommendIntent: recommendIntent ? Number(recommendIntent) : null,
          overallSatisfaction: overallSatisfaction ? Number(overallSatisfaction) : null,
          feedbackNote: feedbackNote ? String(feedbackNote) : null,
        },
      })

      return res.status(201).json({ survey })
    } catch (err: unknown) {
      console.error(err)
      return res.status(500).json({ error: (err as Error).message })
    }
  } else if (req.method === "GET") {
    try {
      const token = await getToken({ req, secret })

      if (!token) {
        return res.status(401).json({ error: "Unauthorized: กรุณาเข้าสู่ระบบก่อนดูรายงาน" })
      }

      if (token.role !== "kmuser") {
        return res.status(403).json({ error: "Forbidden: เฉพาะ Admin (kmuser) เท่านั้นที่สามารถดูรายงานได้" })
      }

      const surveys = await prisma.publicSurvey.findMany({ orderBy: { createdAt: "desc" } })
      return res.status(200).json({ surveys })
    } catch (err: unknown) {
      console.error(err)
      return res.status(500).json({ error: (err as Error).message })
    }
  } else {
    return res.status(405).end()
  }
}
