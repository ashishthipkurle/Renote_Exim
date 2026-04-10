import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const users: any[] = await p.$queryRaw`
    SELECT id, email, email_verified, disabled, created_at 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 5
  `
  console.log('Recent auth.users:')
  for (const u of users) {
    console.log(`  ${u.email} | verified=${u.email_verified} | disabled=${u.disabled} | created=${u.created_at}`)
  }

  const publicUsers: any[] = await p.$queryRaw`
    SELECT id, email, "verificationStatus" 
    FROM public.users 
    ORDER BY "createdAt" DESC 
    LIMIT 5
  `
  console.log('\nRecent public.users:')
  for (const u of publicUsers) {
    console.log(`  ${u.email} | status=${u.verificationStatus}`)
  }
}

main().catch(console.error).finally(() => p.$disconnect())
