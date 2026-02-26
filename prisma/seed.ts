import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash("$pG&$AGu8ptFKN", 12)

  const admin = await prisma.user.upsert({
    where: { email: "onebrady@gmail.com" },
    update: { passwordHash },
    create: {
      name: "Brady",
      email: "onebrady@gmail.com",
      passwordHash,
      role: "admin",
    },
  })

  console.log(`✅ Admin user ready: ${admin.email}`)
  console.log("")
  console.log("🚀 Seed complete. Run 'npm run dev' to start.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    await prisma.$disconnect()
  })
