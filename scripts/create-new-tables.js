const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Creating LandingBanner and LandingConfig tables...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS LandingBanner (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imageUrl VARCHAR(1000) NOT NULL,
      altText VARCHAR(500) NULL,
      linkUrl VARCHAR(1000) NULL,
      orderIndex INT NOT NULL DEFAULT 0,
      display BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS LandingConfig (
      \`key\` VARCHAR(100) PRIMARY KEY,
      \`value\` TEXT NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("Tables created successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

