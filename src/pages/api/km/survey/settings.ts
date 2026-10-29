import type { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/libs/authGuard";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SURVEY_CONFIG } from "@/pages/api/survey/config";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // GET: Fetch survey settings
  if (req.method === "GET") {
    try {
      const configs = await prisma.landingConfig.findMany({
        where: {
          key: {
            in: ["surveyStatus", "surveyStartDate", "surveyEndDate", "surveyConfig"],
          },
        },
      });

      const configMap: Record<string, string> = {};
      for (const c of configs) {
        configMap[c.key] = c.value;
      }

      let parsedSurveyConfig = DEFAULT_SURVEY_CONFIG;
      if (configMap.surveyConfig) {
        try {
          parsedSurveyConfig = JSON.parse(configMap.surveyConfig);
        } catch (e) {
          console.error("Failed to parse surveyConfig:", e);
        }
      }

      const surveyStatus = configMap.surveyStatus || "auto";
      const startDateStr = configMap.surveyStartDate || "2026-10-30T00:00:00+07:00";
      const endDateStr = configMap.surveyEndDate || "2026-11-06T23:59:59+07:00";

      // Real-world time evaluation
      const now = new Date();
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);

      let effectiveStatus: "not_started" | "open" | "ended" | "closed" = "closed";
      if (surveyStatus === "open") {
        effectiveStatus = "open";
      } else if (surveyStatus === "closed") {
        effectiveStatus = "closed";
      } else {
        if (now < start) effectiveStatus = "not_started";
        else if (now > end) effectiveStatus = "ended";
        else effectiveStatus = "open";
      }

      // Also get submission count
      const totalResponses = await prisma.publicSurvey.count();

      return res.status(200).json({
        surveyStatus,
        effectiveStatus,
        surveyStartDate: startDateStr,
        surveyEndDate: endDateStr,
        surveyConfig: parsedSurveyConfig,
        totalResponses,
        currentTime: now.toISOString(),
      });
    } catch (error) {
      console.error("GET survey settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // PUT: Update survey settings
  if (req.method === "PUT") {
    try {
      const { surveyStatus, surveyStartDate, surveyEndDate, surveyConfig } = req.body;

      const updates: { key: string; value: string }[] = [];

      if (surveyStatus !== undefined) {
        updates.push({ key: "surveyStatus", value: String(surveyStatus) });
      }
      if (surveyStartDate !== undefined) {
        updates.push({ key: "surveyStartDate", value: String(surveyStartDate) });
      }
      if (surveyEndDate !== undefined) {
        updates.push({ key: "surveyEndDate", value: String(surveyEndDate) });
      }
      if (surveyConfig !== undefined) {
        updates.push({
          key: "surveyConfig",
          value: typeof surveyConfig === "object" ? JSON.stringify(surveyConfig) : String(surveyConfig),
        });
      }

      await prisma.$transaction(
        updates.map((item) =>
          prisma.landingConfig.upsert({
            where: { key: item.key },
            update: { value: item.value },
            create: { key: item.key, value: item.value },
          })
        )
      );

      return res.status(200).json({ message: "Survey settings updated successfully" });
    } catch (error) {
      console.error("PUT survey settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

export default withAuth(handler, ["kmuser"]);

