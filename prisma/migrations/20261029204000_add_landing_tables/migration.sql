-- CreateTable
CREATE TABLE `LandingSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` VARCHAR(100) NOT NULL,
    `session` VARCHAR(50) NOT NULL DEFAULT 'all',
    `category` VARCHAR(150) NOT NULL,
    `categoryColor` VARCHAR(50) NOT NULL DEFAULT 'orange',
    `title` VARCHAR(500) NOT NULL,
    `details` JSON NULL,
    `subSectionTitle` VARCHAR(500) NULL,
    `subSectionItems` JSON NULL,
    `isBreak` BOOLEAN NOT NULL DEFAULT false,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `display` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandingBooth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `location` VARCHAR(500) NOT NULL,
    `units` JSON NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `display` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandingBanner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(1000) NOT NULL,
    `altText` VARCHAR(500) NULL,
    `linkUrl` VARCHAR(1000) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `display` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandingConfig` (
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
