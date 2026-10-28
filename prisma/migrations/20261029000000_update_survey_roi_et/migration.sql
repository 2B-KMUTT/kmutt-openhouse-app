-- Drop and recreate PublicSurvey table for clean new survey schema
DROP TABLE IF EXISTS `PublicSurvey`;

-- CreateTable
CREATE TABLE `PublicSurvey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `sourceChannels` JSON NULL,
    `grade` VARCHAR(191) NULL,
    `stream` VARCHAR(191) NULL,
    `interestedFaculty` JSON NULL,
    `decisionFactors` JSON NULL,
    `worryPoints` VARCHAR(191) NULL,
    `parentGrade` VARCHAR(191) NULL,
    `parentWorries` JSON NULL,
    `parentInfoNeeded` VARCHAR(191) NULL,
    `parentContactChannel` VARCHAR(191) NULL,
    `teacherNeeds` JSON NULL,
    `teacherCreditTransferInterest` INTEGER NULL,
    `teacherSchoolContact` VARCHAR(191) NULL,
    `recommendIntent` INTEGER NULL,
    `overallSatisfaction` INTEGER NULL,
    `feedbackNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
