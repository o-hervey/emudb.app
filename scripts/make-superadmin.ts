import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/make-superadmin.ts <email>");
    process.exit(1);
  }

  // Look up the Supabase user by email via the profiles join.
  // profiles.id === auth.users.id, so we find them by querying auth directly
  // through the service-role client, or we can use Prisma's raw query.
  const result = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
  `;

  if (result.length === 0) {
    console.error(`No Supabase user found with email: ${email}`);
    process.exit(1);
  }

  const userId = result[0].id;

  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: { isSuperAdmin: true },
    create: { id: userId, isSuperAdmin: true },
  });

  console.log(`Done. User ${email} (${profile.id}) is now a superadmin.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => pool.end());
