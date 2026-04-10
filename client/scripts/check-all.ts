import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // Check all recent users
  const users: any[] = await p.$queryRaw`
    SELECT id, email, email_verified, disabled, created_at 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 10
  `
  console.log('Recent auth.users:')
  for (const u of users) {
    console.log(`  ${u.email} | verified=${u.email_verified} | disabled=${u.disabled} | created=${u.created_at}`)
  }

  // Now try to verify freshtest99 and test login directly via HTTP
  const fresh = users.find((u: any) => u.email === 'freshtest99@gmail.com')
  if (fresh) {
    console.log('\nfreshtest99 email_verified:', fresh.email_verified)
    if (!fresh.email_verified) {
      await p.$executeRaw`UPDATE auth.users SET email_verified = true WHERE email = 'freshtest99@gmail.com'`
      console.log('-> Now set to verified')
    }
  }

  // Also check Importerc@gmail.com (the one user tried from the UI)
  const imp = users.find((u: any) => u.email?.toLowerCase().includes('importerc'))
  if (imp) {
    console.log('\nImporterc found:', imp.email, 'verified:', imp.email_verified)
  }
}

main().catch(console.error).finally(() => p.$disconnect())
